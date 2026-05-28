<script setup lang='ts'>
import { computed } from 'vue';
import { VButton } from '@/components/ui';
import { usePlan, useUpdatePlanMutation, type PlanType } from '@/hooks/usePlan';

const { plan, isLoading } = usePlan()
const { mutate: updatePlan, isPending: isUpdating } = useUpdatePlanMutation()

const currentPlan = computed(() => plan.value.type)

const basicFeatures = [
    { icon: 'pi-book', text: 'Criação de planos de estudo personalizados' },
    { icon: 'pi-sitemap', text: 'Gerenciamento de disciplinas e tópicos' },
    { icon: 'pi-check-square', text: 'Marcação de progresso por tópico' },
    { icon: 'pi-calendar', text: 'Cronograma de revisões básico' },
    { icon: 'pi-chart-bar', text: 'Painel de visão geral do plano' },
]

const premiumFeatures = [
    { icon: 'pi-star', text: 'Tudo do plano Basic, sem limites' },
    { icon: 'pi-bolt', text: 'Simulados adaptativos com IA' },
    { icon: 'pi-comments', text: 'Questões com gabarito comentado' },
    { icon: 'pi-chart-line', text: 'Estatísticas detalhadas de desempenho' },
    { icon: 'pi-clock', text: 'Histórico completo de sessões de estudo' },
    { icon: 'pi-bell', text: 'Alertas inteligentes de revisão espaçada' },
]

function handleChangePlan(planType: PlanType) {
    updatePlan(planType)
}
</script>

<template>
    <div class="plans-page animate-fade-in">
        <header class="view-header">
            <p class="text-xs font-label font-bold uppercase tracking-[0.2em] text-primary mb-2">Configurações</p>
            <h1
                class="text-4xl md:text-4xl font-headline font-bold text-on-surface tracking-tight relative inline-block">
                Seu Plano
                <div class="absolute -bottom-2 left-0 w-24 h-1 bg-primary-container/70 rounded-full"></div>
            </h1>
            <p class="mt-6 text-on-surface-muted font-sans max-w-2xl leading-relaxed text-sm">
                Escolha o plano ideal para o seu ritmo de estudos. Desbloqueie recursos avançados e potencialize sua
                jornada acadêmica com o Vincis.
            </p>
        </header>

        <!-- ── Skeleton loading ──────────────────────────────────── -->
        <main v-if="isLoading" class="cards-container">
            <div class="plan-card skeleton-card" v-for="i in 2" :key="i">
                <div class="card-body">
                    <div class="sk sk-badge"></div>
                    <div class="sk sk-title"></div>
                    <div class="sk sk-price"></div>
                    <div class="sk sk-tagline"></div>
                    <div class="sk sk-divider"></div>
                    <div class="sk sk-line" v-for="j in 5" :key="j"></div>
                </div>
                <div class="sk sk-btn"></div>
            </div>
        </main>

        <!-- ── Cards reais ────────────────────────────────────────── -->
        <main v-else class="cards-container">

            <!-- ── Basic ─────────────────────────────────────────────── -->
            <div class="plan-card" :class="{ 'is-active': currentPlan === 'BASIC' }">
                <div class="card-body">
                    <!-- Badge -->
                    <span class="plan-badge basic-badge">Gratuito</span>

                    <!-- Title -->
                    <h3 class="plan-title">Basic</h3>
                    <p class="plan-price">R$&thinsp;0<span class="plan-price-period">/mês</span></p>
                    <p class="plan-tagline">Comece sua jornada sem custo algum.</p>

                    <div class="divider"></div>

                    <!-- Features -->
                    <ul class="feature-list">
                        <li v-for="f in basicFeatures" :key="f.text" class="feature-item">
                            <i :class="['pi', f.icon, 'feature-icon']"></i>
                            <span>{{ f.text }}</span>
                        </li>
                    </ul>
                </div>

                <VButton @click="handleChangePlan('BASIC')" :disabled="currentPlan === 'BASIC' || isUpdating"
                    variant="secondary" class="w-full">
                    <i v-if="currentPlan === 'BASIC'" class="pi pi-check mr-2 text-sm"></i>
                    {{ currentPlan === "BASIC" ? "Plano Atual" : "Selecionar Plano" }}
                </VButton>
            </div>

            <!-- ── Premium ────────────────────────────────────────────── -->
            <div class="plan-card plan-card--premium" :class="{ 'is-active': currentPlan === 'PREMIUM' }">
                <!-- Glow accent -->
                <div class="premium-glow" aria-hidden="true"></div>

                <div class="card-body">
                    <!-- Badge -->
                    <span class="plan-badge premium-badge">
                        <i class="pi pi-star-fill" style="font-size: 9px; vertical-align: 1px; margin-right: 4px;"></i>
                        Premium
                    </span>

                    <!-- Title -->
                    <h3 class="plan-title plan-title--premium">Premium</h3>
                    <p class="plan-price plan-price--premium">R$&thinsp;19,90<span
                            class="plan-price-period plan-price-period--premium">/mês</span></p>
                    <p class="plan-tagline plan-tagline--premium">O conjunto completo para quem leva os estudos a sério.
                    </p>

                    <div class="divider divider--premium"></div>

                    <!-- Features -->
                    <ul class="feature-list">
                        <li v-for="f in premiumFeatures" :key="f.text" class="feature-item feature-item--premium">
                            <i :class="['pi', f.icon, 'feature-icon', 'feature-icon--premium']"></i>
                            <span>{{ f.text }}</span>
                        </li>
                    </ul>
                </div>

                <VButton @click="handleChangePlan('PREMIUM')" :disabled="currentPlan === 'PREMIUM' || isUpdating"
                    variant="primary" class="w-full">
                    <i v-if="currentPlan === 'PREMIUM'" class="pi pi-check mr-2 text-sm"></i>
                    {{ currentPlan === "PREMIUM" ? "Plano Atual" : "Assinar Premium" }}
                </VButton>
            </div>

        </main>
    </div>
</template>

<style scoped>
/* ── Page ──────────────────────────────────────────────────────── */
.plans-page {
    padding-bottom: 3rem;
}

.view-header {
    margin-bottom: 3rem;
}

/* ── Grid ──────────────────────────────────────────────────────── */
.cards-container {
    display: flex;
    align-items: stretch;
    justify-content: center;
    gap: 1.5rem;
    flex-wrap: wrap;
}

/* ── Card base ─────────────────────────────────────────────────── */
.plan-card {
    position: relative;
    width: 380px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 2rem;
    border-radius: 1.25rem;
    background: var(--color-surface-container-lowest);
    border: 1px solid color-mix(in srgb, var(--color-on-surface) 8%, transparent);
    transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.2s ease;
    overflow: hidden;
}

.plan-card:hover {
    border-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
    box-shadow: 0 8px 32px color-mix(in srgb, var(--color-primary) 8%, transparent);
    transform: translateY(-3px);
}

.plan-card.is-active {
    border-color: color-mix(in srgb, var(--color-primary) 40%, transparent);
    box-shadow: 0 4px 20px color-mix(in srgb, var(--color-primary) 10%, transparent);
}

/* ── Premium card overrides ────────────────────────────────────── */
.plan-card--premium {
    background: var(--color-primary-container);
    border-color: color-mix(in srgb, var(--color-on-primary-container) 15%, transparent);
}

.plan-card--premium:hover {
    border-color: color-mix(in srgb, var(--color-on-primary-container) 35%, transparent);
    box-shadow: 0 12px 40px color-mix(in srgb, var(--color-primary) 22%, transparent);
}

.premium-glow {
    position: absolute;
    top: -60px;
    right: -60px;
    width: 180px;
    height: 180px;
    border-radius: 50%;
    background: radial-gradient(circle, color-mix(in srgb, var(--color-primary) 25%, transparent), transparent 70%);
    pointer-events: none;
}

/* ── Card body ─────────────────────────────────────────────────── */
.card-body {
    flex: 1;
    margin-bottom: 1.75rem;
}

/* ── Badge ─────────────────────────────────────────────────────── */
.plan-badge {
    display: inline-block;
    font-family: var(--font-family-sans);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 999px;
    margin-bottom: 1.25rem;
}

.basic-badge {
    background: color-mix(in srgb, var(--color-secondary) 12%, transparent);
    color: var(--color-secondary);
    border: 1px solid color-mix(in srgb, var(--color-secondary) 25%, transparent);
}

.premium-badge {
    background: color-mix(in srgb, var(--color-primary) 18%, transparent);
    color: var(--color-on-primary-container);
    border: 1px solid color-mix(in srgb, var(--color-on-primary-container) 30%, transparent);
}

/* ── Title & price ─────────────────────────────────────────────── */
.plan-title {
    font-family: var(--font-family-serif);
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-on-surface);
    line-height: 1.1;
}

.plan-title--premium {
    color: var(--color-on-primary-container);
}

.plan-price {
    font-family: var(--font-family-sans);
    font-size: 2.25rem;
    font-weight: 800;
    color: var(--color-on-surface);
    margin-top: 0.75rem;
    letter-spacing: -0.02em;
}

.plan-price--premium {
    color: var(--color-on-primary-container);
}

.plan-price-period {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-on-surface-muted);
    margin-left: 2px;
}

.plan-price-period--premium {
    color: color-mix(in srgb, var(--color-on-primary-container) 70%, transparent);
}

.plan-tagline {
    font-family: var(--font-family-sans);
    font-size: 0.8rem;
    color: var(--color-on-surface-muted);
    margin-top: 0.4rem;
    line-height: 1.5;
}

.plan-tagline--premium {
    color: color-mix(in srgb, var(--color-on-primary-container) 75%, transparent);
}

/* ── Divider ───────────────────────────────────────────────────── */
.divider {
    height: 1px;
    background: color-mix(in srgb, var(--color-on-surface) 8%, transparent);
    margin: 1.25rem 0;
}

.divider--premium {
    background: color-mix(in srgb, var(--color-on-primary-container) 18%, transparent);
}

/* ── Feature list ──────────────────────────────────────────────── */
.feature-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
}

.feature-item {
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    font-family: var(--font-family-sans);
    font-size: 0.8125rem;
    color: var(--color-on-surface-muted);
    line-height: 1.45;
}

.feature-item--premium {
    color: color-mix(in srgb, var(--color-on-primary-container) 85%, transparent);
}

.feature-icon {
    flex-shrink: 0;
    font-size: 0.75rem;
    margin-top: 2px;
    color: var(--color-primary);
    opacity: 0.7;
}

.feature-icon--premium {
    color: var(--color-on-primary-container);
    opacity: 0.9;
}

/* ── Skeleton ──────────────────────────────────────────────────── */
.skeleton-card {
    pointer-events: none;
}

.sk {
    border-radius: 6px;
    background: linear-gradient(90deg,
            color-mix(in srgb, var(--color-on-surface) 6%, transparent) 25%,
            color-mix(in srgb, var(--color-on-surface) 12%, transparent) 50%,
            color-mix(in srgb, var(--color-on-surface) 6%, transparent) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
    margin-bottom: 0.75rem;
}

.sk-badge {
    width: 60px;
    height: 20px;
    border-radius: 999px;
}

.sk-title {
    width: 50%;
    height: 36px;
    margin-top: 0.25rem;
}

.sk-price {
    width: 40%;
    height: 42px;
    margin-top: 0.5rem;
}

.sk-tagline {
    width: 80%;
    height: 14px;
    margin-top: 0.25rem;
}

.sk-divider {
    width: 100%;
    height: 1px;
    margin: 1.25rem 0;
}

.sk-line {
    width: 90%;
    height: 13px;
}

.sk-line:nth-child(odd) {
    width: 75%;
}

.sk-btn {
    width: 100%;
    height: 40px;
    border-radius: 8px;
    margin-top: 0;
}

@keyframes shimmer {
    from {
        background-position: 200% 0;
    }

    to {
        background-position: -200% 0;
    }
}

/* ── Animation ─────────────────────────────────────────────────── */
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
</style>