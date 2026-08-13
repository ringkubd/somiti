#!/usr/bin/env bash
# Bump the app version before a release build.
# - versionName: patch +1 (e.g. 1.0.1 -> 1.0.2)
# - versionCode: +1
# Updates app.json, package.json and android/app/build.gradle (keeps prebuild consistent).
set -euo pipefail

cd "$(dirname "$0")/.."

current=$(grep -oE '"version": "[0-9]+\.[0-9]+\.[0-9]+"' app.json | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
code=$(grep -oE 'versionCode [0-9]+' android/app/build.gradle | grep -oE '[0-9]+')

IFS='.' read -r major minor patch <<< "$current"
new="$major.$minor.$((patch + 1))"
newcode=$((code + 1))

echo "Bumping $current (code $code) -> $new (code $newcode)"

sed -i "s/\"version\": \"$current\"/\"version\": \"$new\"/" app.json package.json
sed -i "s/versionCode $code/versionCode $newcode/" android/app/build.gradle
sed -i "s/versionName \"$current\"/versionName \"$new\"/" android/app/build.gradle

echo "Done — run: cd android && ./gradlew bundleRelease assembleRelease"
