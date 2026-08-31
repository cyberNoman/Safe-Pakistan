# Development Guide

<cite>
**Referenced Files in This Document**
- [package.json](file://package.json)
- [babel.config.js](file://babel.config.js)
- [jsconfig.json](file://jsconfig.json)
- [eas.json](file://eas.json)
- [app.json](file://app.json)
- [App.js](file://App.js)
- [src/navigation/AppNavigator.js](file://src/navigation/AppNavigator.js)
- [src/theme/tokens.js](file://src/theme/tokens.js)
- [src/components/ThreatRing.js](file://src/components/ThreatRing.js)
- [src/screens/HomeScreen.js](file://src/screens/HomeScreen.js)
- [src/screens/VoiceScreen.js](file://src/screens/VoiceScreen.js)
- [README.md](file://README.md)
- [START-HERE.md](file://START-HERE.md)
- [DESIGN_RULES.md](file://DESIGN_RULES.md)
</cite>

## Update Summary
**Changes Made**
- Updated EAS Cloud Builds section to include project ID and owner configuration
- Added Android audio permissions documentation for voice recording capabilities
- Enhanced troubleshooting section with EAS-specific guidance
- Updated dependency analysis to reflect current Expo SDK version

## Table of Contents
1. Introduction
2. Project Structure
3. Core Components
4. Architecture Overview
5. Detailed Component Analysis
6. Dependency Analysis
7. Performance Considerations
8. Troubleshooting Guide
9. Conclusion
10. Appendices

## Introduction
This guide explains how to set up and develop the Safe Pakistan application using Expo SDK 54 with React Native. It covers environment setup, build configuration (Babel path aliases and Reanimated), IDE support via jsconfig.json, EAS cloud builds with project integration, code organization principles, adding screens and components, animations with Reanimated 3, backend integration points, testing strategies, debugging techniques, performance profiling, common workflows, and troubleshooting for build issues and platform-specific problems.

## Project Structure
Safe Pakistan is an Expo-based app organized by feature areas:
- App entry and navigation live at the root and under src/navigation
- Screens are grouped under src/screens
- Shared UI primitives and reusable widgets live under src/components
- Design tokens and typography live under src/theme
- Platform and build metadata are defined in app.json and eas.json
- Babel and IDE configs are at babel.config.js and jsconfig.json

```mermaid
graph TB
A["App.js"] --> B["src/navigation/AppNavigator.js"]
B --> C["src/screens/*"]
B --> D["src/components/*"]
C --> E["src/theme/tokens.js"]
D --> E
A --> F["app.json"]
A --> G["eas.json"]
A --> H["babel.config.js"]
A --> I["jsconfig.json"]
```

**Diagram sources**
- [App.js:1-44](file://App.js#L1-L44)
- [src/navigation/AppNavigator.js:1-121](file://src/navigation/AppNavigator.js#L1-L121)
- [src/theme/tokens.js:1-129](file://src/theme/tokens.js#L1-L129)
- [app.json:1-46](file://app.json#L1-L46)
- [eas.json:1-14](file://eas.json#L1-L14)
- [babel.config.js:1-11](file://babel.config.js#L1-L11)
- [jsconfig.json:1-15](file://jsconfig.json#L1-L15)

**Section sources**
- [README.md:12-46](file://README.md#L12-L46)
- [START-HERE.md:1-26](file://START-HERE.md#L1-L26)

## Core Components
- App entry loads fonts and mounts the navigator inside a safe area provider.
- Navigation uses React Navigation v6 with a native stack and a bottom tab navigator for main flows.
- Theme tokens centralize colors, fonts, spacing, radius, shadows, gradients, and motion timings.
- Reusable components include animated rings, badges, cards, overlays, and status indicators.

Key responsibilities:
- App.js: font loading, safe area wrapping, mounting navigator
- AppNavigator.js: route definitions, tab bar styling, screen transitions
- tokens.js: single source of truth for design tokens
- ThreatRing.js: animated SVG ring driven by Reanimated shared values

**Section sources**
- [App.js:1-44](file://App.js#L1-L44)
- [src/navigation/AppNavigator.js:1-121](file://src/navigation/AppNavigator.js#L1-L121)
- [src/theme/tokens.js:1-129](file://src/theme/tokens.js#L1-L129)
- [src/components/ThreatRing.js:1-92](file://src/components/ThreatRing.js#L1-L92)

## Architecture Overview
The app follows a layered architecture:
- Presentation layer: screens and reusable components
- Navigation layer: React Navigation stack and tabs
- Theming layer: centralized tokens and typography
- Build/runtime layer: Expo config, Babel plugins, EAS settings

```mermaid
graph TB
subgraph "Presentation"
S1["HomeScreen"]
S2["ScanScreen"]
S3["VerdictScreen"]
S4["VoiceScreen"]
C1["ThreatRing"]
C2["Cards / Indicators / Overlays"]
end
subgraph "Navigation"
N1["AppNavigator (Stack + Tabs)"]
end
subgraph "Theme"
T1["tokens.js"]
end
subgraph "Build & Runtime"
R1["App.js"]
R2["app.json"]
R3["babel.config.js"]
R4["jsconfig.json"]
R5["eas.json"]
end
R1 --> N1
N1 --> S1
N1 --> S2
N1 --> S3
N1 --> S4
S1 --> C1
S1 --> C2
S2 --> C1
S3 --> C2
S4 --> C2
S1 --> T1
S2 --> T1
S3 --> T1
S4 --> T1
R1 --> R2
R1 --> R3
R1 --> R4
R1 --> R5
```

**Diagram sources**
- [App.js:1-44](file://App.js#L1-L44)
- [src/navigation/AppNavigator.js:1-121](file://src/navigation/AppNavigator.js#L1-L121)
- [src/theme/tokens.js:1-129](file://src/theme/tokens.js#L1-L129)
- [src/components/ThreatRing.js:1-92](file://src/components/ThreatRing.js#L1-L92)
- [src/screens/VoiceScreen.js:1-102](file://src/screens/VoiceScreen.js#L1-L102)
- [app.json:1-46](file://app.json#L1-L46)
- [babel.config.js:1-11](file://babel.config.js#L1-L11)
- [jsconfig.json:1-15](file://jsconfig.json#L1-L15)
- [eas.json:1-14](file://eas.json#L1-L14)

## Detailed Component Analysis

### App Entry and Navigation
- The app entry loads Inter and Noto Nastaliq Urdu fonts before rendering the navigator.
- Navigation defines a native stack with a Welcome flow and a Main tab group, plus full-screen modals like Verdict and Voice.
- Tab icons use Ionicons and theme tokens for active/inactive states.

```mermaid
sequenceDiagram
participant App as "App.js"
participant Nav as "AppNavigator.js"
participant Tabs as "MainTabs"
participant Screen as "HomeScreen"
App->>Nav : mount <NavigationContainer>
Nav->>Tabs : render bottom tabs
Tabs->>Screen : navigate to Home
Screen-->>Tabs : user actions (navigate, press)
```

**Diagram sources**
- [App.js:1-44](file://App.js#L1-L44)
- [src/navigation/AppNavigator.js:1-121](file://src/navigation/AppNavigator.js#L1-L121)
- [src/screens/HomeScreen.js:1-158](file://src/screens/HomeScreen.js#L1-L158)

**Section sources**
- [App.js:1-44](file://App.js#L1-L44)
- [src/navigation/AppNavigator.js:1-121](file://src/navigation/AppNavigator.js#L1-L121)

### Animated Threat Ring
- Uses react-native-svg and react-native-reanimated to animate strokeDashoffset based on a score.
- Leverages shared values and timing functions from Reanimated for smooth transitions.
- Displays a label and numeric value centered over the ring.

```mermaid
flowchart TD
Start(["Render ThreatRing"]) --> Init["Compute circumference<br/>and radius"]
Init --> Animate["useSharedValue animates to score/100"]
Animate --> UpdateProps["Animated props update strokeDashoffset"]
UpdateProps --> Render["SVG Circle renders with animated fill"]
Render --> End(["Display score and label"])
```

**Diagram sources**
- [src/components/ThreatRing.js:1-92](file://src/components/ThreatRing.js#L1-L92)

**Section sources**
- [src/components/ThreatRing.js:1-92](file://src/components/ThreatRing.js#L1-L92)

### Home Screen Composition
- Combines hero gradient card, threat ring, stat cards, and recent activity feed.
- Demonstrates usage of tokens, typography helpers, and reusable components.
- Shows navigation patterns to Library and other features.

```mermaid
classDiagram
class HomeScreen {
+render()
-recentActivity
-quickActions()
}
class ThreatRing {
+score
+size
+color
+label
}
class Tokens {
+COLORS
+FONTS
+SIZE
+RADIUS
+SHADOW
+SPACE
+gradients
}
HomeScreen --> ThreatRing : "uses"
HomeScreen --> Tokens : "imports"
```

**Diagram sources**
- [src/screens/HomeScreen.js:1-158](file://src/screens/HomeScreen.js#L1-L158)
- [src/components/ThreatRing.js:1-92](file://src/components/ThreatRing.js#L1-L92)
- [src/theme/tokens.js:1-129](file://src/theme/tokens.js#L1-L129)

**Section sources**
- [src/screens/HomeScreen.js:1-158](file://src/screens/HomeScreen.js#L1-L158)

### Voice Screen with Audio Capabilities
- Full-screen voice agent interface with animated microphone and ripple effects.
- Supports multiple languages (English, Urdu, Roman Urdu) with language selection chips.
- Implements state machine for voice interaction: idle, listening, processing, done.
- Requires Android audio permissions for recording functionality.

```mermaid
stateDiagram-v2
[*] --> Idle
Idle --> Listening : Tap to speak
Listening --> Processing : Voice detected
Processing --> Done : Analysis complete
Done --> Idle : Reset
```

**Diagram sources**
- [src/screens/VoiceScreen.js:1-102](file://src/screens/VoiceScreen.js#L1-L102)

**Section sources**
- [src/screens/VoiceScreen.js:1-102](file://src/screens/VoiceScreen.js#L1-L102)

## Dependency Analysis
- Expo SDK 54 with React Native 0.81.x and Reanimated 4 are pinned for compatibility.
- Navigation v6 is used with native stack and bottom tabs.
- Path aliasing via module-resolver enables @/ imports; jsconfig mirrors this for IDE IntelliSense.
- EAS CLI version constraint ensures consistent cloud builds.
- Audio capabilities enabled through expo-av plugin for voice recording features.

```mermaid
graph LR
Pkg["package.json"] --> Expo["expo ~54.0.0"]
Pkg --> RN["react-native 0.81.5"]
Pkg --> Rea["react-native-reanimated ~4.1.1"]
Pkg --> Nav["@react-navigation/* ^6.x"]
Pkg --> Svg["react-native-svg 15.12.1"]
Pkg --> AV["expo-av ~16.0.8"]
Babel["babel.config.js"] --> MR["module-resolver alias '@' -> 'src'"]
Babel --> ReaPlugin["react-native-reanimated/plugin"]
JSConf["jsconfig.json"] --> Paths["@/* -> src/*"]
EAS["eas.json"] --> CLIVersion["cli >= 12.0.0"]
```

**Diagram sources**
- [package.json:1-42](file://package.json#L1-L42)
- [babel.config.js:1-11](file://babel.config.js#L1-L11)
- [jsconfig.json:1-15](file://jsconfig.json#L1-L15)
- [eas.json:1-14](file://eas.json#L1-L14)

**Section sources**
- [package.json:1-42](file://package.json#L1-L42)
- [babel.config.js:1-11](file://babel.config.js#L1-L11)
- [jsconfig.json:1-15](file://jsconfig.json#L1-L15)
- [eas.json:1-14](file://eas.json#L1-L14)

## Performance Considerations
- Prefer Reanimated shared values and animated styles for smooth 60fps animations instead of core Animated API.
- Use tokenized shadows and avoid heavy gradients where possible; reserve gradients for hero surfaces.
- Keep lists virtualized if growing beyond current datasets; currently small arrays are fine.
- Avoid unnecessary re-renders by memoizing expensive computations or extracting stable components.
- Profile animations and layout shifts using React DevTools Profiler and Flipper when needed.
- Voice recording features should handle audio permissions gracefully and provide fallbacks when unavailable.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide

### Environment Setup
- Node.js: Use a recent LTS version compatible with Expo CLI and your toolchain.
- Expo CLI: Ensure you can run npx expo start and that the CLI version meets eas.json constraints.
- Dependencies: Install dependencies listed in package.json; do not mix incompatible versions of Reanimated, SVG, Screens, and Safe Area Context.

**Section sources**
- [package.json:1-42](file://package.json#L1-L42)
- [eas.json:1-14](file://eas.json#L1-L14)

### Build Configuration
- Babel path alias: The module-resolver plugin maps @/ to src/. Ensure it is present and configured correctly.
- Reanimated plugin: Must be included last in Babel plugins to transform Reanimated code properly.
- jsconfig paths: Mirror Babel alias so your IDE resolves @/ imports and provides IntelliSense.

**Section sources**
- [babel.config.js:1-11](file://babel.config.js#L1-L11)
- [jsconfig.json:1-15](file://jsconfig.json#L1-L15)

### EAS Cloud Builds and Project Integration
- CLI version: eas.json requires CLI version >= 12.0.0.
- Project ID: app.json contains EAS project ID for cloud build identification.
- Owner configuration: app.json specifies the EAS owner account for project management.
- Preview profile: Configured to produce an Android APK for internal distribution.
- App metadata: app.json defines name, slug, scheme, orientation, splash, and platform identifiers.
- Audio permissions: Android permissions for RECORD_AUDIO and MODIFY_AUDIO_SETTINGS are configured for voice recording capabilities.

**Updated** Added EAS project integration with project ID and owner configuration, plus Android audio permissions for voice recording.

**Section sources**
- [eas.json:1-14](file://eas.json#L1-L14)
- [app.json:1-46](file://app.json#L1-L46)

### Android Audio Permissions
- Required permissions: RECORD_AUDIO and MODIFY_AUDIO_SETTINGS are declared in app.json for voice recording functionality.
- Permission handling: Apps must request runtime permissions on Android devices before accessing microphone.
- Fallback behavior: Voice features should gracefully handle permission denials and provide user feedback.
- Testing: Test voice recording features on both emulators and physical devices to ensure proper permission handling.

**New Section** Added documentation for Android audio permissions required for voice recording capabilities.

**Section sources**
- [app.json:28-31](file://app.json#L28-L31)
- [src/screens/VoiceScreen.js:1-102](file://src/screens/VoiceScreen.js#L1-L102)

### Common Issues
- Reanimated build errors: Verify the Reanimated plugin is last in babel.config.js and that all required packages are installed.
- Path resolution failures: Confirm both babel.config.js and jsconfig.json define the same @/ alias mapping to src/.
- Navigation crashes: Ensure all screens referenced in AppNavigator exist and are exported correctly.
- Font loading: Fonts must be loaded in App.js before rendering content; otherwise text may not appear.
- Platform-specific styling: Tab bar heights differ between iOS and Android; ensure safe area insets are respected.
- EAS authentication: Ensure you're logged into the correct EAS account matching the project owner configuration.
- Audio permission denied: Handle cases where users deny microphone permissions and provide alternative functionality.

**Updated** Added EAS authentication and audio permission troubleshooting guidance.

**Section sources**
- [babel.config.js:1-11](file://babel.config.js#L1-L11)
- [jsconfig.json:1-15](file://jsconfig.json#L1-L15)
- [src/navigation/AppNavigator.js:1-121](file://src/navigation/AppNavigator.js#L1-L121)
- [App.js:1-44](file://App.js#L1-L44)
- [app.json:38-43](file://app.json#L38-L43)

## Conclusion
Safe Pakistan is a well-structured Expo app with clear separation of concerns, centralized theming, and robust navigation. By following the development guidelines—using Reanimated for animations, adhering to design tokens, configuring Babel and IDE support consistently, leveraging EAS for cloud builds with project integration, and implementing proper audio permissions—you can extend the app confidently while maintaining performance and consistency.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### Development Workflow
- Initialize and run:
  - Install dependencies and start the dev server using the scripts in package.json.
  - Use platform-specific commands for Android, iOS, or web.
- Add a new screen:
  - Create a file under src/screens with a default export component.
  - Register it in AppNavigator within the appropriate navigator (stack or tabs).
  - Wire navigation from existing screens using the navigation prop.
- Create a reusable component:
  - Place it under src/components and import tokens from src/theme/tokens.
  - Keep props minimal and focused; prefer composition over complex logic.
- Implement animations:
  - Use Reanimated 3 APIs (shared values, animated styles, timing/easing).
  - Reference ThreatRing for an example of SVG animation with Reanimated.
- Integrate backend services:
  - Use fetch or a preferred HTTP client to call the backend endpoint documented in README.
  - Handle loading states and navigate to result screens with parameters.
- Configure EAS builds:
  - Ensure project ID and owner are correctly set in app.json.
  - Use EAS CLI to build and distribute apps to different environments.

**Updated** Added EAS build configuration workflow.

**Section sources**
- [package.json:1-42](file://package.json#L1-L42)
- [src/navigation/AppNavigator.js:1-121](file://src/navigation/AppNavigator.js#L1-L121)
- [src/components/ThreatRing.js:1-92](file://src/components/ThreatRing.js#L1-L92)
- [README.md:173-202](file://README.md#L173-L202)
- [app.json:38-43](file://app.json#L38-L43)

### Testing Strategies
- Unit tests: Test pure utility functions and hooks in isolation using Jest.
- Component tests: Render components with mocked contexts and navigation to verify behavior.
- Integration tests: Validate navigation flows and data fetching with test doubles.
- Visual regression: Capture screenshots of key screens to detect unintended UI changes.
- Audio permission testing: Test voice recording features with and without permissions granted.

**Updated** Added audio permission testing strategy.

[No sources needed since this section provides general guidance]

### Debugging Techniques
- Metro logs: Inspect console output for runtime errors and warnings.
- React DevTools: Inspect component trees, props, and state; profile renders.
- Network inspection: Use browser or device network tools to inspect API calls.
- Platform differences: Test on both iOS and Android emulators/devices to catch platform-specific issues.
- EAS build logs: Monitor cloud build logs for compilation errors and permission issues.
- Audio debugging: Test microphone access and audio recording on physical devices for accurate results.

**Updated** Added EAS build logging and audio debugging guidance.

[No sources needed since this section provides general guidance]

### Performance Profiling
- Use React DevTools Profiler to identify expensive re-renders and long tasks.
- Measure animation performance with frame rate monitoring.
- Audit bundle size and lazy-load non-critical modules if necessary.
- Optimize voice recording features to minimize memory usage during audio processing.

**Updated** Added voice recording performance considerations.

[No sources needed since this section provides general guidance]

### EAS Configuration Reference
- Project ID: Located in app.json under extra.eas.projectId for cloud build identification.
- Owner: Set in app.json under expo.owner for project ownership and team collaboration.
- Build profiles: Defined in eas.json for different deployment targets (preview, production).
- CLI requirements: Minimum EAS CLI version specified in eas.json for compatibility.

**New Section** Added comprehensive EAS configuration reference.

**Section sources**
- [app.json:38-43](file://app.json#L38-L43)
- [eas.json:1-14](file://eas.json#L1-L14)