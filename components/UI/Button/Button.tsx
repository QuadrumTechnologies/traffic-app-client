interface Props {
  onClick?: (e: any) => void;
  id?: string;
  type: "button" | "submit" | "reset" | undefined;
  className?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const Button: React.FC<Props> = ({
  onClick,
  className,
  type,
  disabled,
  id,
  style,
  children,
}) => {
  return (
    <button
      onClick={onClick}
      className={`btn ${className ? className : "button"}`}
      id={id}
      type={type}
      style={style}
      aria-label={id}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
export default Button;
