import { useEffect, useState } from "react";
import TodoItem from "./TodoItem";
import { Construction } from "lucide-react";

type Priority = "Urgent" | "Moyenne" | "Basse";

type Todo = {
  id: number;
  texte: string;
  priority: Priority;
  completed: boolean;
};

function App() {
  const [input, setInput] = useState<string>("");
  const [priority, setPriority] = useState<Priority>("Moyenne");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Priority | "Tous" | "Actifs" | "Terminés">("Tous");
  const [selectedTodos, setSelectedTodos] = useState<Set<number>>(new Set());

  useEffect(() => {
      fetch('/api/todos')
      .then((res) => res.json())
      .then((data) => setTodos(data))
      .catch((err) => console.error("Erreur chargement :", err));
  }, []);

  async function addTodo() {
    if (input.trim() === "") return;

    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texte: input.trim(), priority }),
    });

    if (response.ok) {
      const newTodo = await response.json();
      setTodos([newTodo, ...todos]);
      setInput("");
      setPriority("Moyenne");
    }
  }

  async function deleteTodo(id: number) {
    const response = await fetch(`/api/todos/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setTodos(todos.filter((todo) => todo.id !== id));
      const newSelected = new Set(selectedTodos);
      newSelected.delete(id);
      setSelectedTodos(newSelected);
    }
  }

  async function editTodo(id: number, newText: string) {
    const todoToEdit = todos.find(t => t.id === id);
    if (!todoToEdit) return;

    const response = await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texte: newText, completed: todoToEdit.completed }),
    });

    if (response.ok) {
      setTodos(todos.map((todo) => (todo.id === id ? { ...todo, texte: newText } : todo)));
    }
  }

  async function finishSelected(selectedTodosSet: Set<number>) {
    for (const id of selectedTodosSet) {
      const todo = todos.find(t => t.id === id);
      if (todo) {
        await fetch(`/api/todos/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texte: todo.texte, completed: true }),
        });
      }
    }
    setTodos(todos.map(t => selectedTodosSet.has(t.id) ? { ...t, completed: true } : t));
    setSelectedTodos(new Set());
  }

  function toggleSelectTodo(id: number) {
    const newSelected = new Set(selectedTodos);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedTodos(newSelected);
  }

  const filteredTodos = todos.filter((t) => {
    if (filter === "Actifs") return !t.completed;
    if (filter === "Terminés") return t.completed;
    if (filter !== "Tous") return t.priority === filter;
    return true;
  });

  const urgentCount = todos.filter((t) => t.priority === "Urgent").length;
  const mediumCount = todos.filter((t) => t.priority === "Moyenne").length;
  const lowCount = todos.filter((t) => t.priority === "Basse").length;
  const totalCount = todos.length;

  return (
    <div className="flex justify-center">
      <div className="w-2/3 flex flex-col gap-4 my-15 bg-base-300 p-5 rounded-2xl">
        <div className="flex gap-4">
          <input type="text" className="input w-full" placeholder="ajouter une tache..." value={input} onChange={(e) => setInput(e.target.value)} />
          <select className="input w-full" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            <option value="Urgent">Urgent</option>
            <option value="Moyenne">Moyenne</option>
            <option value="Basse">Basse</option>
          </select>
          <button onClick={addTodo} className="btn btn-primary">ajouter</button>
        </div>

        <div className="space-y-2 flex-1 h-fit">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-4">
              <button className={`btn btn-soft ${filter === "Tous" ? "btn-primary" : ""}`} onClick={() => setFilter("Tous")}>Tous ({totalCount})</button>
              <button className={`btn btn-soft ${filter === "Urgent" ? "btn-primary" : ""}`} onClick={() => setFilter("Urgent")}>Urgent ({urgentCount})</button>
              <button className={`btn btn-soft ${filter === "Moyenne" ? "btn-primary" : ""}`} onClick={() => setFilter("Moyenne")}>Moyenne ({mediumCount})</button>
              <button className={`btn btn-soft ${filter === "Basse" ? "btn-primary" : ""}`} onClick={() => setFilter("Basse")}>Basse ({lowCount})</button>
              <button className={`btn btn-soft ${filter === "Actifs" ? "btn-primary" : ""}`} onClick={() => setFilter("Actifs")}>Actifs</button>
              <button className={`btn btn-soft ${filter === "Terminés" ? "btn-primary" : ""}`} onClick={() => setFilter("Terminés")}>Terminés</button>
            </div>
            <button onClick={() => finishSelected(selectedTodos)} className="btn btn-primary" disabled={selectedTodos.size === 0}>
              finir la sélection ({selectedTodos.size})
            </button>
          </div>

          {filteredTodos.length > 0 ? (
            <ul className="divide-y divide-primary/20">
              {filteredTodos.map((todo) => (
                <li key={todo.id}>
                  <TodoItem todo={todo} isSelected={selectedTodos.has(todo.id)} onDelete={() => deleteTodo(todo.id)} onToggleSelect={toggleSelectTodo} onEdit={editTodo} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex justify-center items-center flex-col p-5">
              <Construction strokeWidth={1} className="w-40 h-40 text-primary" />
              <p className="text-sm">Aucune tâche pour ce filtre</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
