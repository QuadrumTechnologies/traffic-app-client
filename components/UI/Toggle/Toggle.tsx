import styles from "./Toggle.module.css";
const Toggle = ({
  type,
  checked,
}: {
  type: "a" | "b" | "c";
  checked: boolean;
}) => {
  return (
    <div className={`${styles.container}`}>
      <input
        className={`${styles.input}`}
        id="switch-on"
        type="radio"
        name="switch"
        checked={checked}
      />
      <input
        className={`${styles.input}`}
        id="switch-off"
        type="radio"
        name="switch"
      />
      <div className={`${styles.switch}`}>
        <label className={`${styles.label}`} htmlFor="switch-on"></label>
        <label className={`${styles.label}`} htmlFor="switch-off"></label>
        <div className={`${styles.pin_wrapper}`}>
          <div className={`${styles.pin} ${styles.pin_on}`}>
            <div className={`${styles.pin_corners}`}>
              <span>0</span>
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
              <span>8</span>
              <span>9</span>
              <span>10</span>
              <span>11</span>
              <span>12</span>
            </div>
            <div className={`${styles.pin_center}`}></div>
          </div>
          <div className={`${styles.pin} ${styles.pin_off}`}>
            <div className={`${styles.pin_corners}`}>
              <span>0</span>
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
              <span>5</span>
              <span>6</span>
              <span>7</span>
              <span>8</span>
              <span>9</span>
              <span>10</span>
              <span>11</span>
              <span>12</span>
            </div>
            <div className={`${styles.pin_center}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Toggle;
