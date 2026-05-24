<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'

const router = useRouter()
const visible = ref(false)

onMounted(() => {
  setTimeout(() => { visible.value = true }, 50)
})

const navigateToAuth = () => {
  router.push('/auth')
}
</script>

<template>
  <div class="bg-[#fdf9f6] text-[#1c1b1a] min-h-screen antialiased font-['Manrope',sans-serif] selection:bg-[#ffe088] selection:text-[#241a00] relative">
    <div class="fixed inset-0 pointer-events-none z-[100] bg-repeat opacity-[0.02] mix-blend-overlay" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuB06q0j1pBG3vL9wkq_E_lkJoiqBexJmUKzsImTOW87PdmqlglImGmJFgI6qnQV7OY8_7x1PiLmZamNSt-ztLt1Gqad-adfiqc1ytlIhIJeUihNNDcIbbqlXkHL_7cVIQ1XSStETJUDDuzKKh5XMWlfUo4pIvMQ9x7rFD1iTwGeqeS0nBYbmGOqY8m3M1JYg0cs_V-_lHmdj6ItG3GdhtksvTcxSE7cUTByd1C8JnPN81j4P03sVJPsyI6ITcTDEQFE8C8Kl59af6JJ');"></div>

    <header class="fixed top-0 w-full z-50 bg-[#fdf9f6]/80 backdrop-blur-xl border-b border-[#1c1b1a]/5">
      <nav class="flex justify-between items-center px-8 py-5 max-w-screen-2xl mx-auto">
        <div class="flex items-center gap-3">
          <div class="font-['Newsreader',serif] italic text-3xl font-bold tracking-tighter text-[#1c1b1a] flex items-baseline">
            VINCIS<span class="text-[#735c00] text-4xl leading-none">.</span>
          </div>
        </div>
        <div class="hidden md:flex items-center space-x-12">
          <a class="text-[#735c00] font-bold border-b-2 border-[#735c00]/40 pb-1 text-xs uppercase tracking-[0.2em]" href="#metodologia">Metodologia</a>
          <a class="text-[#1c1b1a]/60 font-medium hover:text-[#1c1b1a] transition-colors text-xs uppercase tracking-[0.2em]" href="#recursos">Recursos</a>
          <a class="text-[#1c1b1a]/60 font-medium hover:text-[#1c1b1a] transition-colors text-xs uppercase tracking-[0.2em]" href="#diagnostico">Diagnóstico</a>
        </div>
        <button 
          @click="navigateToAuth" 
          class="bg-[#1c1b1a] text-[#fdf9f6] px-8 py-3 rounded-full text-xs font-black uppercase tracking-[0.25em] hover:bg-[#735c00] hover:text-white transition-all active:scale-95 shadow-lg shadow-[#1c1b1a]/10"
        >
          Iniciar Jornada
        </button>
      </nav>
    </header>

    <section id="metodologia" class="relative min-h-[95vh] flex items-center pt-32 pb-20 overflow-hidden" style="background: radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.08) 0%, rgba(253, 249, 246, 0) 70%);">
      <div class="absolute inset-0 z-0 overflow-hidden">
        <img class="w-full h-full object-cover opacity-[0.05] scale-110 lg:scale-100" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBn7PWUM_BN9Ma_1mA0MjouKhxOSXG92coN1cLvzt4lZBnv3JMb5Qd7eUDEzottC8sMPTuL_YH-bTAaSY9H_RkWplfeKDAFNRZJJey8spQOYyDZPeq94aIMZkV91uYl_J1fBGGK6m7zBsBbd7qyVPer0VFdH0-USgrJ_9NZzz5j4bdMu3AdZn3EJ9e12-GRjyUfxvgFZCvBCp3BiCPngL6erqScyLd6d5nQxx5WlqpGd3m6otWIGDgK7RkQhI_UyIJohWN-nUPoXKbh" alt="Esboços anatômicos vintage">
        <div class="absolute inset-0 bg-gradient-to-b from-transparent via-[#fdf9f6]/20 to-[#fdf9f6]"></div>
      </div>
      
      <div class="container mx-auto px-8 relative z-10 transition-all duration-1000 ease-out" :class="visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'">
        <div class="max-w-5xl mx-auto text-center mb-16">
          <span class="inline-block px-5 py-2 bg-[#735c00]/5 text-[#735c00] font-black text-[10px] tracking-[0.4em] uppercase rounded-full mb-10 border border-[#735c00]/10">
            Organização inteligente para concursos
          </span>
          <h1 class="font-['Newsreader',serif] text-6xl md:text-8xl lg:text-9xl font-bold text-[#1c1b1a] leading-[0.95] tracking-tight mb-12 drop-shadow-sm">
            Sua aprovação <br>
            começa com <br>
            <span class="italic text-[#735c00] font-normal">método.</span>
          </h1>
          <p class="text-lg md:text-xl text-[#1c1b1a]/70 max-w-2xl mx-auto leading-relaxed mb-14">
            Gerencie disciplinas, crie rotinas e acompanhe sua evolução — tudo em um só lugar, sincronizando sua dedicação com a precisão da IA.
          </p>
          <div class="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button 
              @click="navigateToAuth" 
              class="prestige-btn bg-[#735c00] text-white px-12 py-6 rounded-full font-black text-sm uppercase tracking-[0.3em] hover:shadow-2xl hover:shadow-[#735c00]/20 hover:-translate-y-1 transition-all active:scale-95"
            >
              Começar Gratuitamente
            </button>
            <span class="text-xs font-bold uppercase tracking-widest text-[#1c1b1a]/40">Sem cartão de crédito</span>
          </div>
        </div>

        <div class="max-w-4xl mx-auto mt-24 relative">
          <div class="absolute -inset-20 bg-[#735c00]/10 blur-[120px] rounded-full opacity-30"></div>
          <div class="relative z-10 p-2 bg-gradient-to-b from-[#1c1b1a]/10 to-transparent rounded-[2.5rem] shadow-2xl bg-[#ebe7e4]">
            
            <div class="bg-[#fdf9f6] rounded-[2.2rem] border border-[#1c1b1a]/5 p-6 md:p-10 grid md:grid-cols-3 gap-8">
              
              <div class="bg-[#f1edea] p-6 rounded-2xl border border-[#1c1b1a]/5">
                <div class="text-[10px] font-black uppercase tracking-[0.1em] text-[#1c1b1a]/40 mb-4">Hoje</div>
                <div class="space-y-4">
                  <div>
                    <div class="flex justify-between text-xs font-bold mb-1"><span>D. Constitucional</span><span class="text-[#735c00]">72%</span></div>
                    <div class="h-1.5 w-full bg-[#1c1b1a]/5 rounded-full"><div class="h-full bg-[#735c00] rounded-full" style="width: 72%"></div></div>
                  </div>
                  <div>
                    <div class="flex justify-between text-xs font-bold mb-1"><span>Raciocínio Lógico</span><span class="text-[#735c00]">55%</span></div>
                    <div class="h-1.5 w-full bg-[#1c1b1a]/5 rounded-full"><div class="h-full bg-[#735c00] rounded-full" style="width: 55%"></div></div>
                  </div>
                  <div>
                    <div class="flex justify-between text-xs font-bold mb-1"><span>Português</span><span class="text-[#735c00]">88%</span></div>
                    <div class="h-1.5 w-full bg-[#1c1b1a]/5 rounded-full"><div class="h-full bg-[#735c00] rounded-full" style="width: 88%"></div></div>
                  </div>
                </div>
              </div>

              <div class="bg-[#f1edea] p-6 rounded-2xl border border-[#1c1b1a]/5 flex flex-col justify-between">
                <div class="text-[10px] font-black uppercase tracking-[0.1em] text-[#1c1b1a]/40 mb-4">Semana</div>
                <div class="grid grid-cols-3 gap-2 text-center">
                  <div><div class="font-['Newsreader',serif] text-2xl font-bold text-[#735c00]">14h</div><div class="text-[9px] uppercase tracking-wider text-[#1c1b1a]/50">estudadas</div></div>
                  <div><div class="font-['Newsreader',serif] text-2xl font-bold text-[#1c1b1a]">87</div><div class="text-[9px] uppercase tracking-wider text-[#1c1b1a]/50">questões</div></div>
                  <div><div class="font-['Newsreader',serif] text-2xl font-bold text-[#1c1b1a]">9</div><div class="text-[9px] uppercase tracking-wider text-[#1c1b1a]/50">matérias</div></div>
                </div>
              </div>

              <div class="bg-[#1c1b1a] text-[#fdf9f6] p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                <i class="pi pi-bolt text-[#e9c349] text-3xl mb-2"></i>
                <div class="font-['Newsreader',serif] text-3xl italic font-bold text-[#e9c349]">12 dias</div>
                <div class="text-[10px] uppercase tracking-widest text-[#fdf9f6]/50 mt-1">sequência de foco</div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </section>

    <div class="border-y border-[#1c1b1a]/5 bg-[#f1edea]">
      <div class="max-w-4xl mx-auto padding py-10 px-8 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
        <div class="text-center">
          <strong class="font-['Newsreader',serif] text-3xl font-bold text-[#1c1b1a] block">+18 mil</strong>
          <span class="text-xs uppercase tracking-widest text-[#1c1b1a]/40 font-bold">concurseiros ativos</span>
        </div>
        <div class="hidden md:block h-8 w-px bg-[#1c1b1a]/10"></div>
        <div class="text-center">
          <strong class="font-['Newsreader',serif] text-3xl font-bold text-[#735c00] block">4.9 ★</strong>
          <span class="text-xs uppercase tracking-widest text-[#1c1b1a]/40 font-bold">avaliação média</span>
        </div>
        <div class="hidden md:block h-8 w-px bg-[#1c1b1a]/10"></div>
        <div class="text-center">
          <strong class="font-['Newsreader',serif] text-3xl font-bold text-[#1c1b1a] block">+200</strong>
          <span class="text-xs uppercase tracking-widest text-[#1c1b1a]/40 font-bold">editais mapeados</span>
        </div>
      </div>
    </div>

    <section id="recursos" class="py-40 bg-[#1c1b1a] text-[#fdf9f6] relative overflow-hidden">
      <div class="absolute top-0 right-0 w-1/2 h-full bg-[#735c00]/5 -skew-x-12 translate-x-1/2 pointer-events-none"></div>
      <div class="container mx-auto px-8 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div class="lg:col-span-5">
            <span class="text-[#735c00] font-black text-[10px] tracking-[0.5em] uppercase mb-8 block">Rigor Intelectual</span>
            <h2 class="font-['Newsreader',serif] text-5xl md:text-7xl font-bold leading-tight mb-10">Projetado para quem busca a maestria.</h2>
            <p class="text-xl text-[#fdf9f6]/60 leading-relaxed mb-12">
              Ferramentas que não apenas organizam, mas elevam sua capacidade de retenção a níveis sem precedentes.
            </p>
            <div class="h-px w-32 bg-[#735c00] mb-12"></div>
          </div>
          
          <div class="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="group p-10 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 hover:border-[#735c00]/30 transition-all duration-500">
              <div class="w-12 h-12 rounded-xl bg-[#735c00]/20 flex items-center justify-center mb-10 text-[#e9c349]">
                <i class="pi pi-book text-xl"></i>
              </div>
              <h3 class="font-['Newsreader',serif] text-3xl font-bold mb-6">Planos de Estudo</h3>
              <p class="text-[#fdf9f6]/50 leading-relaxed text-sm">
                Monte rotinas baseadas no seu edital de forma fluida. O Vincis organiza o conteúdo de acordo com o seu tempo disponível.
              </p>
            </div>
            
            <div class="group p-10 bg-[#735c00] text-white rounded-3xl border border-[#735c00] shadow-2xl shadow-[#735c00]/20">
              <div class="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-10">
                <i class="pi pi-chart-bar text-xl"></i>
              </div>
              <h3 class="font-['Newsreader',serif] text-3xl font-bold mb-6">Métricas Reais</h3>
              <p class="text-white/80 leading-relaxed text-sm">
                Gráficos analíticos e relatórios preditivos que mostram sua evolução semanal real até o dia de abertura do edital.
              </p>
            </div>

            <div class="group p-10 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 hover:border-[#735c00]/30 transition-all duration-500">
              <div class="w-12 h-12 rounded-xl bg-[#735c00]/20 flex items-center justify-center mb-10 text-[#e9c349]">
                <i class="pi pi-sitemap text-xl"></i>
              </div>
              <h3 class="font-['Newsreader',serif] text-3xl font-bold mb-6">Gestão Temática</h3>
              <p class="text-[#fdf9f6]/50 leading-relaxed text-sm">
                Monitore o avanço em tópicos específicos de cada matéria e descubra instantaneamente quais pontos exigem revisão urgente.
              </p>
            </div>

            <div class="group p-10 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 hover:border-[#735c00]/30 transition-all duration-500">
              <div class="w-12 h-12 rounded-xl bg-[#735c00]/20 flex items-center justify-center mb-10 text-[#e9c349]">
                <i class="pi pi-clock text-xl"></i>
              </div>
              <h3 class="font-['Newsreader',serif] text-3xl font-bold mb-6">Controle de Horas</h3>
              <p class="text-[#fdf9f6]/50 leading-relaxed text-sm">
                Cronometre sessões de foco profundo e entenda perfeitamente a divisão do tempo investido por disciplina estudada.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="diagnostico" class="py-40 bg-[#f7f3f0] overflow-hidden">
      <div class="container mx-auto px-8">
        <div class="bg-white rounded-[3rem] shadow-xl border border-[#1c1b1a]/5 overflow-hidden">
          <div class="grid lg:grid-cols-2 items-stretch">
            <div class="p-16 lg:p-24 flex flex-col justify-center">
              <span class="text-[#735c00] font-black text-[10px] tracking-[0.5em] uppercase mb-10 block">Inteligência Preditiva</span>
              <h3 class="font-['Newsreader',serif] text-5xl font-bold mb-8 leading-tight">Diagnóstico de Sinapse IA</h3>
              <p class="text-[#1c1b1a]/60 leading-relaxed mb-12">
                Nossa inteligência compreende seus padrões biológicos e de retenção. Receba relatórios profundos sobre níveis de fadiga mental e recomendações cirúrgicas de revisão bibliográfica.
              </p>
              <button @click="navigateToAuth" class="flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] text-[#1c1b1a] hover:text-[#735c00] transition-colors group text-left">
                Descobrir meu perfil
                <i class="pi pi-arrow-right group-hover:translate-x-2 transition-transform text-xs"></i>
              </button>
            </div>
            
            <div class="bg-[#735c00]/5 p-16 lg:p-24 border-l border-[#1c1b1a]/5 flex flex-col justify-center">
              <div class="space-y-12">
                <div>
                  <div class="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-[#1c1b1a]/40">
                    <span>Retenção Cognitiva</span>
                    <span class="text-[#735c00]">84%</span>
                  </div>
                  <div class="h-1.5 w-full bg-[#1c1b1a]/5 rounded-full">
                    <div class="h-full bg-[#735c00] rounded-full w-[84%] relative">
                      <div class="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-[#735c00] rounded-full shadow-sm"></div>
                    </div>
                  </div>
                </div>
                
                <div class="grid grid-cols-2 gap-8">
                  <div class="p-8 bg-white rounded-2xl border border-[#1c1b1a]/5 shadow-sm">
                    <div class="text-[10px] font-black uppercase tracking-[0.2em] text-[#1c1b1a]/40 mb-2">Estado de Flow</div>
                    <div class="text-3xl font-['Newsreader',serif] italic font-bold text-[#735c00]">Ótimo</div>
                  </div>
                  <div class="p-8 bg-white rounded-2xl border border-[#1c1b1a]/5 shadow-sm">
                    <div class="text-[10px] font-black uppercase tracking-[0.2em] text-[#1c1b1a]/40 mb-2">Foco Médio</div>
                    <div class="text-3xl font-['Newsreader',serif] italic font-bold text-[#1c1b1a]">52min</div>
                  </div>
                </div>
                
                <div class="p-8 bg-[#1c1b1a] rounded-2xl text-[#fdf9f6]">
                  <div class="flex items-center gap-4 mb-4">
                    <i class="pi pi-lightbulb text-[#e9c349]"></i>
                    <span class="text-[10px] font-black uppercase tracking-[0.2em] text-[#fdf9f6]/60">Insight Vincis</span>
                  </div>
                  <p class="text-sm italic opacity-90 leading-relaxed font-['Newsreader',serif]">
                    "Seus picos de retenção ocorrem entre 08h e 10h. Sugerimos mover blocos complexos de 'Direito Administrativo' para este período."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-40 bg-[#fdf9f6] relative flex justify-center text-center">
      <div class="container mx-auto px-8 max-w-4xl flex flex-col items-center">
        <i class="pi pi-comment text-[#735c00]/15 mb-10 text-6xl md:text-7xl"></i>
        <blockquote class="font-['Newsreader',serif] italic text-4xl md:text-6xl leading-tight text-[#1c1b1a] mb-16">
          "O conhecimento é o único tesouro que se multiplica quando compartilhado."
        </blockquote>
        <div class="flex items-center justify-center gap-6 w-full">
          <div class="h-px w-12 bg-[#1c1b1a]/20"></div>
          <cite class="text-xs uppercase tracking-[0.5em] font-black text-[#735c00] not-italic">
            Leonardo da Vinci
          </cite>
          <div class="h-px w-12 bg-[#1c1b1a]/20"></div>
        </div>
      </div>
    </section>

    <section class="py-40 bg-[#fdf9f6] relative border-t border-[#1c1b1a]/5">
      <div class="container mx-auto px-8 text-center">
        <h2 class="font-['Newsreader',serif] text-6xl md:text-8xl font-bold mb-16 tracking-tight">
          Pronto para sua <br>
          <span class="italic text-[#735c00] font-normal">renascença?</span>
        </h2>
        <button 
          @click="navigateToAuth"
          class="bg-[#1c1b1a] text-[#fdf9f6] px-16 py-8 rounded-full font-black text-sm uppercase tracking-[0.4em] hover:bg-[#735c00] hover:text-white transition-all active:scale-95 shadow-2xl relative after:absolute after:inset-[-4px] after:border after:border-[#735c00]/20 after:rounded-full"
        >
          Iniciar Agora — É Grátis
        </button>
      </div>
    </section>

    <footer class="bg-[#ebe7e4] w-full py-24 px-8 border-t border-[#1c1b1a]/5">
      <div class="max-w-screen-2xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          <div class="lg:col-span-5">
            <div class="font-['Newsreader',serif] italic text-4xl font-bold tracking-tighter text-[#1c1b1a] mb-8">
              VINCIS<span class="text-[#735c00]">.</span>
            </div>
            <p class="text-base text-[#1c1b1a]/50 max-w-sm leading-relaxed">
              Unindo o legado da tradição acadêmica clássica com a fronteira da inovação digital. Projetado para mentes que se recusam a aceitar limites.
            </p>
          </div>
          
          <div class="lg:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div class="space-y-6">
              <h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-[#735c00]">Plataforma</h4>
              <ul class="space-y-4 text-sm font-bold text-[#1c1b1a]/60">
                <li><a class="hover:text-[#1c1b1a] transition-colors" href="#">Metodologia</a></li>
                <li><a class="hover:text-[#1c1b1a] transition-colors" href="#">Recursos</a></li>
              </ul>
            </div>
            <div class="space-y-6">
              <h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-[#735c00]">Empresa</h4>
              <ul class="space-y-4 text-sm font-bold text-[#1c1b1a]/60">
                <li><a class="hover:text-[#1c1b1a] transition-colors" href="#">Sobre Nós</a></li>
                <li><a class="hover:text-[#1c1b1a] transition-colors" href="#">Manifesto</a></li>
              </ul>
            </div>
            <div class="space-y-6">
              <h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-[#735c00]">Suporte</h4>
              <ul class="space-y-4 text-sm font-bold text-[#1c1b1a]/60">
                <li><a class="hover:text-[#1c1b1a] transition-colors" href="#">Central de Ajuda</a></li>
              </ul>
            </div>
            <div class="space-y-6">
              <h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-[#735c00]">Legal</h4>
              <ul class="space-y-4 text-sm font-bold text-[#1c1b1a]/60">
                <li><a class="hover:text-[#1c1b1a] transition-colors" href="#">Privacidade</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-[#1c1b1a]/5">
          <p class="text-[10px] font-bold text-[#1c1b1a]/40 uppercase tracking-widest mb-8 md:mb-0">
            © {{ new Date().getFullYear() }} Vincis Academic. Inspirado pelo mestre, movido por inteligência.
          </p>
          <div class="flex gap-4">
            <button class="w-12 h-12 rounded-full flex items-center justify-center bg-[#1c1b1a]/5 hover:bg-[#735c00]/20 transition-all group">
              <i class="pi pi-envelope text-lg group-hover:text-[#735c00]"></i>
            </button>
            <button class="w-12 h-12 rounded-full flex items-center justify-center bg-[#1c1b1a]/5 hover:bg-[#735c00]/20 transition-all group">
              <i class="pi pi-share-alt text-lg group-hover:text-[#735c00]"></i>
            </button>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.prestige-btn {
  position: relative;
}
.prestige-btn::after {
  content: '';
  position: absolute;
  inset: -4px;
  border: 1px solid rgba(115, 92, 0, 0.2);
  border-radius: inherit;
  pointer-events: none;
  transition: all 0.3s ease;
}
.prestige-btn:hover::after {
  inset: -6px;
  opacity: 0.5;
}
</style>