import { toast } from "react-toastify";

export const emitToastMessageGradient = (
  message: string,
  type: "error" | "success" | "info" | "warning"
) => {
  const commonStyles = {
    position: "top-right" as const,
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored" as const,
    style: {
      fontSize: "0.95rem",
      fontWeight: "500",
      letterSpacing: "0.025rem",
      lineHeight: "1.5",
      padding: "1rem 1.25rem",
      borderRadius: "12px",
      boxShadow:
        "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
    },
    progressStyle: {
      background: "rgba(255, 255, 255, 0.3)",
      height: "3px",
    },
  };

  switch (type) {
    case "error":
      return toast.error(message, {
        ...commonStyles,
        style: {
          ...commonStyles.style,
          background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
          color: "#ffffff",
        },
        progressStyle: {
          ...commonStyles.progressStyle,
          background: "rgba(255, 255, 255, 0.4)",
        },
      });

    case "success":
      return toast.success(message, {
        ...commonStyles,
        style: {
          ...commonStyles.style,
          background: "linear-gradient(135deg, #51cf66 0%, #40c057 100%)",
          color: "#ffffff",
        },
        progressStyle: {
          ...commonStyles.progressStyle,
          background: "rgba(255, 255, 255, 0.4)",
        },
      });

    case "info":
      return toast.info(message, {
        ...commonStyles,
        style: {
          ...commonStyles.style,
          background: "linear-gradient(135deg, #74c0fc 0%, #339af0 100%)",
          color: "#ffffff",
        },
        progressStyle: {
          ...commonStyles.progressStyle,
          background: "rgba(255, 255, 255, 0.4)",
        },
      });

    case "warning":
      return toast.warn(message, {
        ...commonStyles,
        style: {
          ...commonStyles.style,
          background: "linear-gradient(135deg, #ffd43b 0%, #fab005 100%)",
          color: "#1a1a1a",
        },
        progressStyle: {
          ...commonStyles.progressStyle,
          background: "rgba(0, 0, 0, 0.2)",
        },
      });

    default:
      return toast(message, {
        ...commonStyles,
        style: {
          ...commonStyles.style,
          background: "linear-gradient(135deg, #868e96 0%, #495057 100%)",
          color: "#ffffff",
        },
      });
  }
};

export const emitToastMessage = (
  message: string,
  type: "error" | "success" | "info" | "warning",
  options?: {
    duration?: number | false;
    toastId?: string;
  }
): string => {
  const commonStyles = {
    position: "top-right" as const,
    autoClose: options?.duration ?? 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored" as const,
    style: {
      fontSize: "1rem",
      fontWeight: "500",
      letterSpacing: "0.025rem",
      lineHeight: "1.5",
      padding: "1rem 1.25rem",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    },
    progressStyle: {
      background: "rgba(255, 255, 255, 0.3)",
      height: "3px",
    },
  };

  const colors = {
    error: { bg: "#ef4444", color: "#ffffff" },
    success: { bg: "#10b981", color: "#ffffff" },
    info: { bg: "#3b82f6", color: "#ffffff" },
    warning: { bg: "#f59e0b", color: "#1f2937" },
  };

  const selectedColor = colors[type];

  const toastOptions = {
    ...commonStyles,
    toastId: options?.toastId,
    autoClose: options?.duration ?? commonStyles.autoClose,
    style: {
      ...commonStyles.style,
      background: selectedColor.bg,
      color: selectedColor.color,
    },
  };

  if (options?.toastId && toast.isActive(options.toastId)) {
    // Update existing toast
    toast.update(options.toastId, {
      render: message,
      type,
      ...toastOptions,
    });
    return options.toastId;
  } else {
    // Create new toast
    return toast[type](message, toastOptions) as string;
  }
};
