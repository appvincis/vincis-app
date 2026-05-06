<script setup lang="ts">
interface Props {
    size?: 'sm' | 'md' | 'lg';
    color?: string;
}

withDefaults(defineProps<Props>(), {
    size: 'md',
    color: 'var(--primary)'
});

const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4'
};
</script>

<template>
    <div class="flex justify-center items-center py-4">
        <div 
            :class="[sizeClasses[size], 'border-solid rounded-full animate-spin']"
            :style="{ 
                borderColor: color,
                borderTopColor: 'transparent'
            }"
        ></div>
    </div>
</template>

<style scoped>
.animate-spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
</style>
