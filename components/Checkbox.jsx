import React from "react";

const Checkbox = ({ id, label }) => {
  return (
    <div className="checkbox-container">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="checkbox" className="custom-checkbox" />
    </div>
  );
};

export default Checkbox;
