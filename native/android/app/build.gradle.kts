plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

/* The app is the same app/ folder the website serves (index.html plus the hand-tracking files),
   bundled so it opens and works with no signal. */
val web = layout.buildDirectory.dir("generated/web")
val copyWeb by tasks.registering(Copy::class) {
    from(rootProject.file("../../app")) { into("app") }
    from(rootProject.file("../../icons")) { into("icons") }
    from(rootProject.file("../../favicon.ico"))
    into(web)
}
val keystorePath: String? = System.getenv("SENYAS_KEYSTORE")

android {
    namespace = "ph.senyas.app"
    compileSdk = 36
    defaultConfig {
        applicationId = "ph.senyas.app"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0.0"
    }
    signingConfigs {
        if (keystorePath != null) create("upload") {
            storeFile = file(keystorePath)
            storePassword = System.getenv("SENYAS_KEYSTORE_PASSWORD")
            keyAlias = System.getenv("SENYAS_KEY_ALIAS")
            keyPassword = System.getenv("SENYAS_KEY_PASSWORD")
        }
    }
    buildTypes {
        release {
            isMinifyEnabled = false
            if (keystorePath != null) signingConfig = signingConfigs.getByName("upload")
        }
    }
    androidResources { noCompress += listOf("wasm", "task") }
    sourceSets["main"].assets.srcDir(web)
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    kotlinOptions { jvmTarget = "17" }
}
tasks.named("preBuild") { dependsOn(copyWeb) }

dependencies {
    implementation("androidx.core:core-ktx:1.16.0")
    implementation("androidx.appcompat:appcompat:1.7.1")
    implementation("androidx.activity:activity-ktx:1.10.1")
    implementation("androidx.webkit:webkit:1.14.0")
}
