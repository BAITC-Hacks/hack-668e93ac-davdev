Чтобы собирать на Android:

1. Установите все зависимости для Tauri по руководству [tauri.app/start/prerequisites](https://tauri.app/start/prerequisites/)
2. Добавьте src-tauri\gen\android\keystore.properties следующего вида:

```TOML
password=xxxxxx
keyAlias=upload
storeFile=C:\\upload-keystore.jks
```

3. Добавьте src-tauri\gen\android\app\google-services.json из Firebase
4. Поставьте %userprofile%\user\.gradle\gradle.properties

```TOML
gpr.user=github_username
gpr.key=ghp_xxxxxxxxxxx
```
