import { createContext, useContext, useState } from "react";
import { ErrorToast } from "./ErrorToast";

const ErrorContext = createContext(null);

export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
}

export function ErrorProvider({ children }) {
  const [errors, setErrors] = useState([]);

  const showError = (errorConfig) => {
    const id = Date.now();
    const error =
      typeof errorConfig === "string"
        ? { message: errorConfig, type: "Error" }
        : { type: "Error", ...errorConfig };

    setErrors((prev) => [...prev, { ...error, id }]);
  };

  const dismissError = (id) => {
    setErrors((prev) => prev.filter((error) => error.id !== id));
  };

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}
      <div className="error-container">
        {errors.map((error) => (
          <ErrorToast
            key={error.id}
            message={error.message}
            type={error.type}
            onDismiss={() => dismissError(error.id)}
          />
        ))}
      </div>
    </ErrorContext.Provider>
  );
}
