import { Checkbox, Button, TextField } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { styled } from "@mui/material/styles";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SaveIcon from "@mui/icons-material/Save";
import { red, grey } from "@mui/material/colors";

const CustomCheckbox = styled(Checkbox)(({ theme }) => ({
  color: grey[500], // Cor padrão da borda
  "& .MuiSvgIcon-root": {
    fill: grey[500], // Cor de preenchimento quando não marcado
  },
  "&.Mui-checked": {
    color: "#FF5A60", // Cor quando o checkbox está marcado
    "& .MuiSvgIcon-root": {
      fill: "#FF5A60", // Cor de preenchimento quando marcado
    },
  },
  transform: "scale(1.5)", // Aumenta o tamanho do checkbox
}));

const CustomFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  ".MuiFormControlLabel-label": {
    fontSize: "1.5rem", // Aumenta o tamanho do label
  },
}));

export default function Home() {
  const [items, setItems] = useState([]);
  const [newLabel, setNewLabel] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [holdingItemId, setHoldingItemId] = useState(null);
  const [editingItemId, setEditingItemId] = useState(null);
  const inputRef = useRef(null);
  const addContainerRef = useRef(null);
  const editContainerRef = useRef(null);
  const deleteContainerRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // Buscar jobs da API
    const fetchJobs = async () => {
      const response = await fetch("/api/jobs");
      const data = await response.json();
      setItems(data);
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (addContainerRef.current &&
          !addContainerRef.current.contains(event.target)) ||
        (editContainerRef.current &&
          !editContainerRef.current.contains(event.target)) ||
        (deleteContainerRef.current &&
          !deleteContainerRef.current.contains(event.target))
      ) {
        setIsAdding(false);
        setIsEditing(false);
        setIsHolding(false);
        setHoldingItemId(null);
        setEditingItemId(null);
      }
    };

    if (isAdding || isEditing || isHolding) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAdding, isEditing, isHolding]);

  const handleJobCheckbox = async (id) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setItems(updatedItems);

    // Atualizar o estado do job no banco de dados
    const job = updatedItems.find((item) => item.id === id);
    await fetch("/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(job),
    });
  };

  const handleAddItem = async () => {
    if (newLabel.trim() !== "") {
      const newItem = {
        id: items.length + 1,
        label: newLabel,
        checked: false,
      };
      setItems([...items, newItem]);
      setNewLabel(""); // Limpa o input após adicionar o item
      setIsAdding(false); // Volta ao estado normal

      // Adicionar o novo job ao banco de dados
      await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      });
    }
  };

  const handleInputChange = (event) => {
    setNewLabel(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      if (isEditing) {
        handleEditItem(editingItemId);
      } else {
        handleAddItem();
      }
    }
  };

  const handleStartAdding = () => {
    setIsAdding(true);
  };

  const handleMouseDown = (id) => {
    timerRef.current = setTimeout(() => {
      setIsHolding(true);
      setHoldingItemId(id);
    }, 1000); // 1 segundo para detectar o clique longo
  };

  const handleMouseUp = () => {
    clearTimeout(timerRef.current);
  };

  const handleStartEditing = (id) => {
    setIsEditing(true);
    setEditingItemId(id);
    const itemToEdit = items.find((item) => item.id === id);
    setNewLabel(itemToEdit.label);
  };

  const handleEditItem = async (id) => {
    if (newLabel.trim() !== "") {
      const updatedItems = items.map((item) =>
        item.id === id ? { ...item, label: newLabel } : item
      );
      setItems(updatedItems);
      setNewLabel(""); // Limpa o input após editar o item
      setIsEditing(false);
      setEditingItemId(null);
      setIsHolding(false);
      setHoldingItemId(null);

      // Atualizar o job no banco de dados
      await fetch(`/api/jobs?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ label: newLabel }),
      });
    }
    closeBar();
  };

  const closeBar = () => {
    setIsEditing(false);
  };
  const handleDeleteItem = async (id) => {
    const response = await fetch(`/api/jobs?id=${id}`, { method: "DELETE" });
    if (response.ok) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  return (
    <>
      <div className="container mt-16 pl-6">
        <h2 className="font-bold text-3xl">tasked</h2>
      </div>
      <div className="container pl-6 bg-light ">
        <FormGroup>
          {items.map((item) => (
            <div
              key={item.id}
              onMouseDown={() => handleMouseDown(item.id)}
              onMouseUp={handleMouseUp}
              onTouchStart={() => handleMouseDown(item.id)}
              onTouchEnd={handleMouseUp}
            >
              <CustomFormControlLabel
                control={
                  <CustomCheckbox
                    className="custom-checkbox"
                    checked={item.checked}
                    color="primary"
                    onChange={() => handleJobCheckbox(item.id)}
                  />
                }
                label={
                  <span className={item.checked ? "line-through" : ""}>
                    {item.label}
                  </span>
                }
              />
              {isHolding && holdingItemId === item.id && (
                <div className="flex space-x-2" ref={editContainerRef}>
                  <Button
                    style={{
                      backgroundColor: "blue",
                      color: "white",
                      fontWeight: "bold",
                      marginRight: 10,
                    }}
                    onClick={() => handleStartEditing(item.id)}
                  >
                    Editar
                  </Button>
                  <Button
                    style={{
                      backgroundColor: "red",
                      color: "white",
                      fontWeight: "bold",
                      marginRight: 10,
                    }}
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    Apagar
                  </Button>
                </div>
              )}
            </div>
          ))}
          {isAdding && (
            <div className="flex items-center" ref={addContainerRef}>
              <CustomFormControlLabel
                control={
                  <CustomCheckbox
                    className="custom-checkbox"
                    checked={false}
                    color="primary"
                    disabled
                  />
                }
                label={
                  <TextField
                    inputRef={inputRef}
                    type="text"
                    value={newLabel}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    placeholder="Novo item"
                    variant="standard"
                    InputProps={{
                      style: { fontSize: "1.5rem", color: "blue" }, // Ajusta o tamanho da fonte e a cor do texto
                    }}
                  />
                }
              />
              <Button
                style={{
                  backgroundColor: "blue",
                  color: "white",
                  fontWeight: "bold",
                  marginRight: 10,
                }}
                onClick={handleAddItem}
              >
                Ok
              </Button>
            </div>
          )}
          {isEditing && (
            <div className="flex items-center" ref={editContainerRef}>
              <CustomFormControlLabel
                control={
                  <CustomCheckbox
                    className="custom-checkbox"
                    checked={false}
                    color="primary"
                    disabled
                  />
                }
                label={
                  <TextField
                    inputRef={inputRef}
                    type="text"
                    value={newLabel}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    placeholder="Editar item"
                    variant="standard"
                    InputProps={{
                      style: { fontSize: "1.5rem", color: "blue" }, // Ajusta o tamanho da fonte e a cor do texto
                    }}
                  />
                }
              />
              <Button
                style={{
                  backgroundColor: "blue",
                  color: "white",
                  fontWeight: "bold",
                  marginRight: 10,
                }}
                onClick={() => handleEditItem(editingItemId)}
              >
                Ok
              </Button>
            </div>
          )}
        </FormGroup>
        <div className="absolute bottom-0 right-0 m-4 flex space-x-4">
          <Button onClick={isAdding ? handleAddItem : handleStartAdding}>
            <AddCircleIcon sx={{ color: red[500], fontSize: 70 }} />
          </Button>
        </div>
      </div>
    </>
  );
}
