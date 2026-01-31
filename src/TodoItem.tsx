import { Trash, Pencil, Check, X } from "lucide-react";
import { useState } from "react";

type Priority = "Urgent" | "Moyenne" | "Basse";

type Todo = {
  id: number;
  texte: string;
  priority: Priority;
  completed: boolean; // ajout de completed
};

type Props = {
  todo: Todo;
  onDelete: () => void;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  onEdit: (id: number, newText: string) => void;
};

const TodoItem = ({ todo, onDelete, isSelected, onToggleSelect, onEdit }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.texte);

  function handleSave() {
    if (editText.trim() === "") return;
    onEdit(todo.id, editText.trim());
    setIsEditing(false);
  }

  return (
    <li className={`p-3 transition rounded-xl ${todo.completed ? "bg-base-200 opacity-70" : ""}`}>
      <div className="flex justify-between items-center">
        {/* Checkbox + texte + badges */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            className="checkbox checkbox-primary checkbox-sm"
            checked={isSelected}
            disabled={todo.completed}
            onChange={() => onToggleSelect(todo.id)}
          />

          {isEditing ? (
            <input
              className="input input-sm"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
          ) : (
            <span className={`text-md font-bold transition-all ${todo.completed ? "line-through text-base-content/40" : ""}`}>
              {todo.texte}
            </span>
          )}

          <span
            className={`badge badge-sm badge-soft ${
              todo.priority === "Urgent" ? "badge-error" : todo.priority === "Moyenne" ? "badge-warning" : "badge-success"
            }`}
          >
            {todo.priority}
          </span>

          {todo.completed && <span className="badge badge-sm badge-neutral">Terminé</span>}
        </div>

        {/* Boutons */}
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="btn btn-sm btn-success btn-soft">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => setIsEditing(false)} className="btn btn-sm btn-ghost">
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="btn btn-sm btn-ghost" disabled={todo.completed}>
              <Pencil className="w-4 h-4" />
            </button>
          )}

          <button onClick={onDelete} className="btn btn-sm btn-error btn-soft">
            <Trash className="w-4 h-4" />
          </button>
        </div>
      </div>
    </li>
  );
};

export default TodoItem;