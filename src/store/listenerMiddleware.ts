import { createListenerMiddleware, addListener } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from ".";

export const listenerMiddleware = createListenerMiddleware();

export const startMiddlewareListening = listenerMiddleware.startListening.withTypes<RootState, AppDispatch>();

export const addAppListener = addListener.withTypes<RootState, AppDispatch>();
