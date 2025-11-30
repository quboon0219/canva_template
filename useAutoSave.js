import { useEffect, useRef } from "react";
import { saveDesign } from "../utils/offlineStore";

export default function useAutoSave(design, id, ms = 5000) {
  const timerRef = useRef();

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveDesign({ id, design, updatedAt: Date.now() }).catch(console.error);
    }, ms);

    return () => clearTimeout(timerRef.current);
  }, [design, id, ms]);
}
