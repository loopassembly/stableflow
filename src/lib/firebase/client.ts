"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getAuth,
  setPersistence,
  type Auth,
} from "firebase/auth";

import { firebaseWebConfig, isFirebaseConfigured } from "@/lib/firebase/config";

let authInstance: Auth | null = null;
let persistencePromise: Promise<void> | null = null;
let googleProvider: GoogleAuthProvider | null = null;

function ensureFirebaseApp() {
  if (!isFirebaseConfigured()) {
    throw new Error("Firebase is not configured for this environment.");
  }

  return getApps().length ? getApp() : initializeApp(firebaseWebConfig);
}

export function getFirebaseAuth() {
  if (!authInstance) {
    authInstance = getAuth(ensureFirebaseApp());
    authInstance.useDeviceLanguage();
  }

  return authInstance;
}

export function getGoogleProvider() {
  if (!googleProvider) {
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: "select_account",
    });
  }

  return googleProvider;
}

export function ensureFirebasePersistence() {
  if (!persistencePromise) {
    persistencePromise = setPersistence(getFirebaseAuth(), browserLocalPersistence).then(
      () => undefined,
    );
  }

  return persistencePromise;
}
