import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

type LogEntry = {
  id: string;
  error: Error;
};

const LOG_SIZE_LIMIT = 10;

const initialState: LogEntry[] = [];

const errorLog = createSlice({
  name: "errorLog",
  initialState,
  reducers: {
    pushToErrorLog: (state, { payload }: PayloadAction<LogEntry>) => {
      const newLog = [...state, payload];

      if (newLog.length > LOG_SIZE_LIMIT) newLog.shift();

      return newLog;
    },

    clearErrorLog: () => [],
  },
});

export const { pushToErrorLog, clearErrorLog } = errorLog.actions;
export default errorLog.reducer;
