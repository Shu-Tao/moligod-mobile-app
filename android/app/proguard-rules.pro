# Proguard rules for Moligod app
-keep class androidx.appcompat.** { *; }
-keep class androidx.core.** { *; }
-keep class androidx.webkit.** { *; }
-keep class com.getcapacitor.** { *; }
-keep class com.capacitorjs.plugins.** { *; }
-keepattributes *Annotation*
-keepattributes JavascriptInterface
-keep class * {
    @android.webkit.JavascriptInterface <methods>;
}
