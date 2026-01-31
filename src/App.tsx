import { useEffect, useState } from "react";
import TodoItem from "./TodoItem";
import { Construction } from "lucide-react";

type Priority = "Urgent" | "Moyenne" | "Basse";

type Todo = {
  id: number;
  texte: string;
  priority: Priority;
  completed: boolean; // ajouté
};

function App() {
  const [input, setInput] = useState<string>("");
  const [priority, setPriority] = useState<Priority>("Moyenne");

  const savedTodos = localStorage.getItem("todos");
  const initialTodos = savedTodos ? JSON.parse(savedTodos) : [];
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [filter, setFilter] = useState<Priority | "Tous" | "Actifs" | "Terminés">("Tous");

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // Ajouter une todo
  function addTodo() {
    if (input.trim() === "") return;

    const newTodo: Todo = {
      id: Date.now(),
      texte: input.trim(),
      priority: priority,
      completed: false,
    };

    setTodos([newTodo, ...todos]);
    setInput("");
    setPriority("Moyenne");
  }

  // Supprimer une todo
  function deleteTodo(id: number) {
    setTodos(todos.filter((todo) => todo.id !== id));
  }

  // Éditer une todo
  function editTodo(id: number, newText: string) {
    setTodos(
      todos.map((todo) => (todo.id === id ? { ...todo, texte: newText } : todo))
    );
  }

  // Marquer comme completed (finir sélection)
  function finishSelected(selectedTodos: Set<number>) {
    setTodos(
      todos.map((todo) =>
        selectedTodos.has(todo.id) ? { ...todo, completed: true } : todo
      )
    );
  }

  // Gestion des todos sélectionnés
  const [selectedTodos, setSelectedTodos] = useState<Set<number>>(new Set());

  function toggleSelectTodo(id: number) {
    const newSelected = new Set(selectedTodos);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedTodos(newSelected);
  }

  // Filtrage
  let filteredTodos = todos;
  if (filter === "Actifs") filteredTodos = todos.filter((t) => !t.completed);
  else if (filter === "Terminés") filteredTodos = todos.filter((t) => t.completed);
  else if (filter !== "Tous") filteredTodos = todos.filter((t) => t.priority === filter);

  const urgentCount = todos.filter((t) => t.priority === "Urgent").length;
  const mediumCount = todos.filter((t) => t.priority === "Moyenne").length;
  const lowCount = todos.filter((t) => t.priority === "Basse").length;
  const totalCount = todos.length;

  return (
    <div className="flex justify-center">
      <div className="w-2/3 flex flex-col gap-4 my-15 bg-base-300 p-5 rounded-2xl">
        {/* Ajouter une todo */}
        <div className="flex gap-4">
          <input
            type="text"
            className="input w-full"
            placeholder="ajouter une tache..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <select
            className="input w-full"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
          >
            <option value="Urgent">Urgent</option>
            <option value="Moyenne">Moyenne</option>
            <option value="Basse">Basse</option>
          </select>

          <button onClick={addTodo} className="btn btn-primary">
            ajouter
          </button>
        </div>

        {/* Filtres + Finir sélection */}
        <div className="space-y-2 flex-1 h-fit">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-4">
              <button
                className={`btn btn-soft ${filter === "Tous" ? "btn btn-primary" : ""}`}
                onClick={() => setFilter("Tous")}
              >
                Tous ({totalCount})
              </button>
              <button
                className={`btn btn-soft ${filter === "Urgent" ? "btn btn-primary" : ""}`}
                onClick={() => setFilter("Urgent")}
              >
                Urgent ({urgentCount})
              </button>
              <button
                className={`btn btn-soft ${filter === "Moyenne" ? "btn btn-primary" : ""}`}
                onClick={() => setFilter("Moyenne")}
              >
                Moyenne ({mediumCount})
              </button>
              <button
                className={`btn btn-soft ${filter === "Basse" ? "btn btn-primary" : ""}`}
                onClick={() => setFilter("Basse")}
              >
                Basse ({lowCount})
              </button>
              <button
                className={`btn btn-soft ${filter === "Actifs" ? "btn btn-primary" : ""}`}
                onClick={() => setFilter("Actifs")}
              >
                Actifs
              </button>
              <button
                className={`btn btn-soft ${filter === "Terminés" ? "btn btn-primary" : ""}`}
                onClick={() => setFilter("Terminés")}
              >
                Terminés
              </button>
            </div>

            <button
              onClick={() => finishSelected(selectedTodos)}
              className="btn btn-primary"
              disabled={selectedTodos.size === 0}
            >
              finir la sélection ({selectedTodos.size})
            </button>
          </div>

          {/* Liste des todos */}
          {filteredTodos.length > 0 ? (
            <ul className="divide-y divide-primary/20">
              {filteredTodos.map((todo) => (
                <li key={todo.id}>
                  <TodoItem
                    todo={todo}
                    isSelected={selectedTodos.has(todo.id)}
                    onDelete={() => deleteTodo(todo.id)}
                    onToggleSelect={toggleSelectTodo}
                    onEdit={editTodo}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex justify-center items-center flex-col p-5">
              <div>
                <Construction strokeWidth={1} className="w-40 h-40 text-primary" />
              </div>
              <p className="text-sm">Aucune tâche pour ce filtre</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;