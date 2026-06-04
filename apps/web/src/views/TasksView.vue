<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { VButton, VInput, VModal, VSelect } from '../components/ui'

interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  createdAt: string
}

type ColumnKey = Task['status']

interface Column {
  key: ColumnKey
  label: string
  icon: string
  color: string
  bgColor: string
}

const columns: Column[] = [
  { key: 'todo', label: 'A Fazer', icon: 'pi-list', color: 'text-outline', bgColor: 'bg-outline/10' },
  { key: 'in-progress', label: 'Em Andamento', icon: 'pi-spinner', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  { key: 'done', label: 'Concluído', icon: 'pi-check-circle', color: 'text-green-600', bgColor: 'bg-green-50' },
]

const STORAGE_KEY = 'vincis_tasks'

const tasks = ref<Task[]>([])

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) tasks.value = JSON.parse(raw)
  } catch { /* ignore */ }
}

function saveTasks() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks.value)) } catch { /* ignore */ }
}

loadTasks()

function getColumnTasks(columnKey: ColumnKey): Task[] {
  return tasks.value
    .filter(t => t.status === columnKey)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// ─── Add Task ─────────────────────────────────────────────────────────────────
const showAddModal = ref(false)
const newTaskTitle = ref('')
const newTaskDescription = ref('')

function openAddModal() {
  newTaskTitle.value = ''
  newTaskDescription.value = ''
  showAddModal.value = true
}

function addTask() {
  const title = newTaskTitle.value.trim()
  if (!title) return
  tasks.value.push({
    id: crypto.randomUUID(),
    title,
    description: newTaskDescription.value.trim(),
    status: 'todo',
    createdAt: new Date().toISOString(),
  })
  saveTasks()
  showAddModal.value = false
}

// ─── Edit Task ────────────────────────────────────────────────────────────────
const showEditModal = ref(false)
const editingTask = ref<Task | null>(null)
const editTitle = ref('')
const editDescription = ref('')
const editStatus = ref<ColumnKey>('todo')

function openEditModal(task: Task) {
  editingTask.value = task
  editTitle.value = task.title
  editDescription.value = task.description
  editStatus.value = task.status
  showEditModal.value = true
}

function saveEdit() {
  if (!editingTask.value) return
  const title = editTitle.value.trim()
  if (!title) return
  const task = tasks.value.find(t => t.id === editingTask.value!.id)
  if (task) {
    task.title = title
    task.description = editDescription.value.trim()
    task.status = editStatus.value
    saveTasks()
  }
  showEditModal.value = false
  editingTask.value = null
}

// ─── Delete Task ──────────────────────────────────────────────────────────────
const showDeleteConfirm = ref(false)
const deletingTask = ref<Task | null>(null)

function confirmDelete(task: Task) {
  deletingTask.value = task
  showDeleteConfirm.value = true
}

function deleteTask() {
  if (!deletingTask.value) return
  tasks.value = tasks.value.filter(t => t.id !== deletingTask.value!.id)
  saveTasks()
  showDeleteConfirm.value = false
  deletingTask.value = null
}

// ─── Move Task ────────────────────────────────────────────────────────────────
function moveTask(taskId: string, newStatus: ColumnKey) {
  const task = tasks.value.find(t => t.id === taskId)
  if (task) {
    task.status = newStatus
    saveTasks()
  }
}

// ─── Format date ──────────────────────────────────────────────────────────────
function formatDate(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()

  if (isSameDay(d, today)) {
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }
  if (isSameDay(d, yesterday)) return 'Ontem'
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}

const statusOptions = [
  { label: 'A Fazer', value: 'todo' },
  { label: 'Em Andamento', value: 'in-progress' },
  { label: 'Concluído', value: 'done' },
]

const totalTasks = computed(() => tasks.value.length)
const doneTasks = computed(() => tasks.value.filter(t => t.status === 'done').length)
</script>

<template>
  <div class="p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
    <!-- View Header -->
    <header class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="space-y-2">
        <p class="font-label text-xs uppercase tracking-[0.2em] text-primary font-bold">Organização</p>
        <h2 class="text-3xl lg:text-4xl font-headline font-bold text-on-surface tracking-tight relative inline-block">
          Tarefas
          <div class="absolute -bottom-2 left-0 w-20 h-1 bg-primary-container/70 rounded-full"></div>
        </h2>
        <p class="text-on-surface-muted max-w-xl text-sm leading-relaxed">
          Gerencie suas tarefas diárias de estudo, revisões e metas acadêmicas.
        </p>
      </div>
      <div class="flex items-center gap-4">
        <div v-if="totalTasks > 0" class="text-sm font-sans text-on-surface-variant">
          <span class="font-bold">{{ doneTasks }}</span>/{{ totalTasks }} concluídas
        </div>
        <VButton variant="primary" @click="openAddModal">
          <i class="pi pi-plus mr-2 text-sm" />
          Nova Tarefa
        </VButton>
      </div>
    </header>

    <!-- Empty State -->
    <div v-if="totalTasks === 0" class="flex flex-col items-center justify-center py-24 px-4 border border-dashed rounded-3xl bg-surface-container-low/30 space-y-5 text-center">
      <div class="w-20 h-20 rounded-full bg-primary-container/20 flex items-center justify-center">
        <i class="pi pi-check-square text-4xl text-primary/60"></i>
      </div>
      <div class="space-y-1 max-w-sm">
        <h3 class="text-lg font-headline font-bold text-on-surface">Nenhuma tarefa criada</h3>
        <p class="text-sm text-on-surface-variant font-sans leading-relaxed">
          Organize seus estudos criando tarefas. Adicione sua primeira tarefa para começar.
        </p>
      </div>
      <VButton variant="primary" @click="openAddModal">
        <i class="pi pi-plus mr-2 text-sm" />
        Criar Primeira Tarefa
      </VButton>
    </div>

    <!-- Board -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
      <div v-for="col in columns" :key="col.key" class="board-column">
        <div class="column-header" :class="col.bgColor">
          <i class="pi text-sm" :class="[col.icon, col.color]"></i>
          <span class="font-sans font-bold text-sm text-on-surface">{{ col.label }}</span>
          <span class="ml-auto text-xs font-sans font-bold text-on-surface-muted bg-surface-container-highest px-2 py-0.5 rounded-full min-w-[24px] text-center">
            {{ getColumnTasks(col.key).length }}
          </span>
        </div>

        <div class="column-body">
          <div
            v-for="task in getColumnTasks(col.key)"
            :key="task.id"
            class="task-card"
            draggable="true"
            @dragstart="(e) => e.dataTransfer?.setData('taskId', task.id)"
            @dragover.prevent
            @drop.prevent="moveTask(task.id, col.key)"
          >
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0 flex-1">
                <h4 class="font-sans font-bold text-sm text-on-surface leading-snug break-words">{{ task.title }}</h4>
                <p v-if="task.description" class="font-sans text-xs text-on-surface-variant mt-1.5 leading-relaxed break-words">
                  {{ task.description }}
                </p>
              </div>
              <div class="flex gap-1 shrink-0">
                <button class="task-action-btn" title="Editar" @click="openEditModal(task)">
                  <i class="pi pi-pencil text-[11px]"></i>
                </button>
                <button class="task-action-btn task-action-btn--delete" title="Excluir" @click="confirmDelete(task)">
                  <i class="pi pi-trash text-[11px]"></i>
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between mt-3 pt-3 border-t border-outline-variant/10">
              <span class="text-[10px] font-sans font-bold uppercase tracking-wider text-outline">{{ formatDate(task.createdAt) }}</span>
              <div class="flex gap-1">
                <button
                  v-for="c in columns.filter(c => c.key !== task.status)"
                  :key="c.key"
                  class="text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-1 rounded-md transition-colors"
                  :class="c.key === 'done' ? 'text-green-600 hover:bg-green-50' : c.key === 'in-progress' ? 'text-amber-600 hover:bg-amber-50' : 'text-outline hover:bg-surface-container'"
                  @click="moveTask(task.id, c.key)"
                >
                  {{ c.key === 'done' ? 'Concluir' : c.key === 'in-progress' ? 'Iniciar' : 'Voltar' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Drop zone empty state -->
          <div v-if="getColumnTasks(col.key).length === 0" class="flex flex-col items-center justify-center py-10 text-center">
            <span class="font-sans text-xs text-on-surface-muted">Nenhuma tarefa</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Modal -->
    <VModal v-model:visible="showAddModal" header="Nova Tarefa">
      <div class="space-y-4">
        <VInput v-model="newTaskTitle" label="Título" placeholder="Digite o título da tarefa" required />
        <div>
          <label class="text-[10px] font-bold uppercase tracking-widest text-outline font-sans block mb-1.5">Descrição (opcional)</label>
          <textarea
            v-model="newTaskDescription"
            placeholder="Adicione uma descrição..."
            class="w-full px-4 py-2.5 bg-surface-container-low rounded-lg border border-outline-variant/40 text-on-surface font-sans text-sm resize-none focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
            rows="3"
          ></textarea>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <VButton variant="secondary" @click="showAddModal = false">Cancelar</VButton>
          <VButton variant="primary" @click="addTask" :disabled="!newTaskTitle.trim()">Adicionar</VButton>
        </div>
      </div>
    </VModal>

    <!-- Edit Modal -->
    <VModal v-model:visible="showEditModal" header="Editar Tarefa">
      <div class="space-y-4">
        <VInput v-model="editTitle" label="Título" placeholder="Digite o título da tarefa" required />
        <div>
          <label class="text-[10px] font-bold uppercase tracking-widest text-outline font-sans block mb-1.5">Descrição (opcional)</label>
          <textarea
            v-model="editDescription"
            placeholder="Adicione uma descrição..."
            class="w-full px-4 py-2.5 bg-surface-container-low rounded-lg border border-outline-variant/40 text-on-surface font-sans text-sm resize-none focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
            rows="3"
          ></textarea>
        </div>
        <div>
          <label class="text-[10px] font-bold uppercase tracking-widest text-outline font-sans block mb-1.5">Status</label>
          <VSelect v-model="editStatus" :options="statusOptions" />
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <VButton variant="secondary" @click="showEditModal = false">Cancelar</VButton>
          <VButton variant="primary" @click="saveEdit" :disabled="!editTitle.trim()">Salvar</VButton>
        </div>
      </div>
    </VModal>

    <!-- Delete Confirm Modal -->
    <VModal v-model:visible="showDeleteConfirm" header="Excluir Tarefa">
      <div class="space-y-4">
        <p class="text-sm font-sans text-on-surface-variant leading-relaxed">
          Tem certeza que deseja excluir a tarefa <strong class="text-on-surface">"{{ deletingTask?.title }}"</strong>? Esta ação não pode ser desfeita.
        </p>
        <div class="flex justify-end gap-3 pt-2">
          <VButton variant="secondary" @click="showDeleteConfirm = false">Cancelar</VButton>
          <VButton variant="error" @click="deleteTask">Excluir</VButton>
        </div>
      </div>
    </VModal>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Board Columns ── */
.board-column {
  display: flex;
  flex-direction: column;
  background: var(--color-surface-container-lowest);
  border: 1px solid var(--color-outline-variant);
  border-radius: 1.25rem;
  min-height: 300px;
}

.column-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.25rem;
  border-radius: 1.25rem 1.25rem 0 0;
  border-bottom: 1px solid var(--color-outline-variant);
}

.column-body {
  flex: 1;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 200px;
}

/* ── Task Card ── */
.task-card {
  background: var(--color-surface-container-low);
  border: 1px solid transparent;
  border-radius: 0.875rem;
  padding: 1rem;
  cursor: default;
  transition: all 0.18s ease;
}

.task-card:hover {
  background: var(--color-surface-container-lowest);
  border-color: var(--color-outline-variant);
  box-shadow: 0 2px 8px rgba(28, 27, 26, 0.05);
  transform: translateY(-1px);
}

.task-action-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  color: var(--color-outline);
  transition: all 0.15s ease;
  cursor: pointer;
  border: none;
  background: transparent;
}

.task-action-btn:hover {
  background: var(--color-surface-container);
  color: var(--color-on-surface);
}

.task-action-btn--delete:hover {
  background: var(--color-error-container);
  color: var(--color-error);
}
</style>
