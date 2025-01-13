interface Props {
  onClick?: (e: any) => void;
  id?: string;
  type: "button" | "submit" | "reset" | undefined;
  className?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<Props> = ({
  onClick,
  className,
  type,
  disabled,
  children,
}) => {
  return (
    <button
      onClick={onClick}
      className="button"
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
export default Button;
