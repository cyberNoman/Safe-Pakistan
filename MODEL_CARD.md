---
base_model: Qwen/Qwen2.5-1.5B-Instruct
library_name: ollama
license: apache-2.0
language:
  - en
  - ur
tags:
  - scam-detection
  - phishing
  - pakistan
  - urdu
  - roman-urdu
  - lora
  - gguf
  - edge-inference
  - safepakistan
---

# Model Card — hifazat-edge

## Model description

**hifazat-edge** is a scam-detection classifier fine-tuned for Safe Pakistan
(Hifazat حفاظت) — Pakistan's AI scam guardian. It is **Layer 1 of a
three-layer inference cascade**: a fast, free, local edge model that answers
confident cases in ~2.3s on CPU, so vulnerable users on slow or zero internet
still get an instant verdict.

- **Base model:** `Qwen/Qwen2.5-1.5B-Instruct`
- **Fine-tuning:** LoRA (Unsloth) on a single Tesla T4
- **Format:** Q4_K_M GGUF, served via Ollama (OpenAI-compatible `/v1` endpoint)
- **Languages:** English, Roman Urdu, Urdu (Nastaliq input)

## Intended use — Layer 1 ONLY, not standalone

Classify a single SMS / WhatsApp message / transcribed call into:

```json
{"verdict":"scam|suspicious|safe","score":0-100,"confidence":0-100,"type":"","redFlags":[]}
```

Inference parameters: `temperature 0.1`, `max_tokens 220`, `format: json`.

The model is designed to be **conservative**: unsure cases return low
confidence so the orchestrator escalates to a stronger cloud model
(confidence gate ≥ 70). **Do not deploy this model standalone** — its JSON
compliance and suspicious-class recall are insufficient without the cascade
safety net (see Limitations).

## Training data

1,500 localized examples hand-built from real Pakistani scam patterns
(JazzCash, Easypaisa, BISP 8171, NADRA CNIC, OTP harvesting, fake prizes):

| Class | Count |
|---|---|
| scam | 864 |
| suspicious | 336 |
| safe | 300 |

Training loss: **2.10 → 0.026** (LoRA, Qwen2.5-1.5B-Instruct, T4).

## Evaluation — 155-message hold-out, 3-run variance

Hold-out: 155 UNSEEN messages (95 scam incl. 5 sender-spoofed · 30
suspicious · 30 safe with trigger words like OTP/Rs/balance). Three full
online runs of the live cascade (`backend/eval-runs.js`):

| Metric | RUN 1 | RUN 2 | RUN 3 | MIN–MAX | MEAN |
|---|---|---|---|---|---|
| Accuracy | 74.8% | 76.8% | 77.4% | 74.8–77.4% | 76.3% |
| Scam recall | 85.3% | 88.4% | 87.4% | 85.3–88.4% | 87.0% |
| Safe precision | 95.8% | 92.6% | 89.3% | 89.3–95.8% | 92.6% |
| Safe FPR | 16.7% | 13.3% | 13.3% | 13.3–16.7% | 14.4% |
| Macro F1 | 69.5% | 69.9% | 71.4% | 69.5–71.4% | 70.3% |
| L1 parse fails | 80 | 76 | 78 | 76–80 | 78.0 |

Regex baseline on the same set: accuracy 46.5%, scam recall 49.5%.

### Per-layer attribution (representative online run)

| Layer | Predictions | Correct | Accuracy |
|---|---|---|---|
| L0_VERIFIED (sender prior) | 22 | 22 | 100.0% |
| FT_MODEL (this model) | 52–60 | — | 56–68% |
| QWEN_MAX (cloud teacher) | 73–81 | — | ~76% |
| RULES (regex floor) | 0 online | — | — |

L0 whitelist/template decisions are perfect by construction; this model is
the fast-and-cheap middle; the cloud layer cleans up its misses.

## Limitations — stated honestly

- **JSON parse failure ≈ 55%** on out-of-distribution input (76–80 per run).
  Every failure escalates silently in the cascade — the user never sees it,
  but it is why this model cannot stand alone.
- **Offline safe precision 35–40%**: without the cloud layer the regex floor
  over-flags legit alerts containing trigger words (conservative by design).
- **±2–3% run-to-run variance** from LLM non-determinism (temperature 0.1).
- **Suspicious-class recall is weak** — smallest training slice (336/1,500).
- Confidence scores are model outputs, not calibrated probabilities.

## Deployment

```bash
OLLAMA_KEEP_ALIVE=24h ollama serve
# model registered locally as `hifazat-edge`
POST http://127.0.0.1:11434/v1/chat/completions
```

Warm-up: run one classification at boot — first-call latency is the main
operational risk. Target: < 4s warm on a mid-range laptop CPU.

## Bias, risks, limitations

- Trained on Pakistani scam patterns; transfer to other regions/languages is
  untested.
- A false SAFE is more harmful than a false SCAM — the cascade prefers
  escalation over guessing.
- The model gives verdicts, not legal advice; reporting goes to NCCIA
  (NCCIA Shikayat), never presented as law-enforcement action.

## Model Details

- **Developed by:** Safe Pakistan team (Noman) — co-built with Qoder AI
- **Model type:** Causal LM, instruction-tuned, LoRA adapter merged
- **Base:** Qwen2.5-1.5B-Instruct (Alibaba)
- **Quantization:** Q4_K_M
- **Cascade context:** L0 sender-prior → **L1 hifazat-edge** → gate ≥ 70 →
  L2 Qwen-Max → L3 on-device rules
