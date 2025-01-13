interface PasswordModalProps {
  requirements: { text: string; isValid: boolean }[];
  show: boolean;
}

const PasswordModal: React.FC<PasswordModalProps> = ({
  requirements,
  show,
}) => {
  return show ? (
    <div className="password-modal">
      <ul>
        {requirements.map((req, index) => (
          <li key={index} style={{ color: req.isValid ? "green" : "red" }}>
            {req.text}
          </li>
        ))}
      </ul>
    </div>
  ) : null;
};

export default PasswordModal;
