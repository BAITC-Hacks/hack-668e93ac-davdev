import java.net.URI
import java.util.Properties
import java.io.FileInputStream

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("rust")
    id("com.google.gms.google-services")
}

val tauriProperties = Properties().apply {
    val propFile = file("tauri.properties")
    if (propFile.exists()) {
        propFile.inputStream().use { load(it) }
    }
}

android {
    compileSdk = 36
    namespace = "kz.davdev.oqucat"
    defaultConfig {
        manifestPlaceholders["usesCleartextTraffic"] = "false"
        applicationId = "kz.davdev.oqucat"
        minSdk = 24
        targetSdk = 36
        versionCode = tauriProperties
            .getProperty("tauri.android.versionCode", "1")
            .toInt()
        versionName = tauriProperties
            .getProperty("tauri.android.versionName", "1.0")

        val telegramClientId = System.getenv("TELEGRAM_CLIENT_ID")
            ?: throw GradleException("TELEGRAM_CLIENT_ID is not set")

        val telegramRedirectUri = System.getenv("TELEGRAM_REDIRECT_URI")
            ?: throw GradleException("TELEGRAM_REDIRECT_URI is not set")

        val telegramHost = URI(telegramRedirectUri).host
            ?: throw GradleException(
                "Invalid TELEGRAM_REDIRECT_URI: $telegramRedirectUri"
            )

        buildConfigField(
            "String",
            "TELEGRAM_CLIENT_ID",
            "\"$telegramClientId\""
        )

        buildConfigField(
            "String",
            "TELEGRAM_REDIRECT_URI",
            "\"$telegramRedirectUri\""
        )

        manifestPlaceholders["telegramLoginHost"] = telegramHost
    }
    signingConfigs {
        create("release") {
            val keystorePropertiesFile = rootProject.file("keystore.properties")
            val keystoreProperties = Properties()
            if (keystorePropertiesFile.exists()) {
                keystoreProperties.load(FileInputStream(keystorePropertiesFile))
            }

            keyAlias = keystoreProperties["keyAlias"] as String
            keyPassword = keystoreProperties["password"] as String
            storeFile = file(keystoreProperties["storeFile"] as String)
            storePassword = keystoreProperties["password"] as String
        }
    }
    buildTypes {
        getByName("debug") {
            applicationIdSuffix = ""
            manifestPlaceholders["usesCleartextTraffic"] = "true"
            isDebuggable = true
            isJniDebuggable = true
            isMinifyEnabled = false

            signingConfig = signingConfigs.getByName("release")

            packaging {
                jniLibs.keepDebugSymbols.add("*/arm64-v8a/*.so")
                jniLibs.keepDebugSymbols.add("*/armeabi-v7a/*.so")
                jniLibs.keepDebugSymbols.add("*/x86/*.so")
                jniLibs.keepDebugSymbols.add("*/x86_64/*.so")
            }
        }
        getByName("release") {
            signingConfig = signingConfigs.getByName("release")
            isMinifyEnabled = true
            proguardFiles(
                *fileTree(".") { include("**/*.pro") }
                    .plus(getDefaultProguardFile("proguard-android-optimize.txt"))
                    .toList().toTypedArray()
            )
        }
    }
    kotlinOptions {
        jvmTarget = "1.8"
    }
    buildFeatures {
        buildConfig = true
    }
}

rust {
    rootDirRel = "../../../"
}

dependencies {
    implementation(platform("com.google.firebase:firebase-bom:34.19.0"))
    implementation("com.google.firebase:firebase-messaging")
    implementation("org.telegram:login-sdk:1.0.0")
    implementation("androidx.webkit:webkit:1.14.0")
    implementation("androidx.appcompat:appcompat:1.7.1")
    implementation("androidx.activity:activity-ktx:1.10.1")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.lifecycle:lifecycle-process:2.10.0")
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.4")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.0")
}

apply(from = "tauri.build.gradle.kts")
