import type { GameDict } from "../types";

// pt-BR narrative content. Tone: news-headline / journalistic register;
// demands stay first-person plural ("Queremos…"); pivot voices stay
// conversational; grant voices stay declarative power-broker tone.
const ptBR: GameDict = {
  blocNames: {
    red: "Trabalho & Sindicatos",
    purple: "Igualdade Social",
    green: "Sustentabilidade",
    blue: "O Mercado",
    orange: "Agronegócio",
    yellow: "Segurança & Ordem",
    grey: "Tradicionalistas",
  },

  demands: {
    red: [
      "Queremos a desapropriação dos prédios de luxo vazios",
      "Queremos um imposto de 90% sobre todos os lucros bancários extraordinários",
      "Queremos a proibição permanente de toda terceirização e trabalho por aplicativo",
      "Queremos o controle estatal de todas as indústrias estratégicas nacionais",
      "Queremos conselhos liderados por trabalhadores em toda grande empresa",
      "Queremos o perdão total de todas as dívidas de consumo",
      "Queremos um teto de riqueza máxima para todos os cidadãos",
      "Queremos todos os imóveis de aluguel confiscados para moradia popular",
      "Queremos a proibição total da herança de riqueza",
    ],
    purple: [
      "Queremos a redistribuição compulsória de terras como reparação",
      "Queremos cidadania incondicional para todos os residentes sem documentos",
      "Queremos a abolição das unidades policiais tradicionais",
      "Queremos cotas obrigatórias de gênero e raça em toda contratação",
      "Queremos a remoção de todos os monumentos da era colonial",
      "Queremos zonas autônomas para o autogoverno indígena",
      "Queremos a legalização de todas as substâncias para uso pessoal",
      "Queremos a substituição da bandeira e do hino nacionais",
      "Queremos um cheque mensal de reparação para todos",
    ],
    green: [
      "Queremos o fechamento da pecuária na Amazônia",
      "Queremos a proibição permanente de voos domésticos curtos",
      "Queremos carne e laticínios taxados como bens nocivos de luxo",
      "Queremos terras privadas confiscadas para corredores ecológicos obrigatórios",
      "Queremos a proibição total de fertilizantes químicos no país",
      'Queremos prisão perpétua para o crime de "Ecocídio"',
      "Queremos hidrelétricas desmontadas para restaurar nossos rios",
      "Queremos a proibição total de jatos e iates particulares",
      "Queremos a criminalização do negacionismo climático",
    ],
    blue: [
      "Queremos a privatização de toda a água e da saúde",
      "Queremos a abolição do salário mínimo para flexibilidade do mercado",
      "Queremos todas as terras públicas vendidas ao maior lance",
      "Queremos a substituição da assistência social por um vale digital único",
      "Queremos zero impostos corporativos pelos próximos dez anos",
      "Queremos governança por IA substituindo a burocracia federal",
      "Queremos o imposto sobre herança zerado para proteger as famílias",
      "Queremos o banco central privatizado",
      "Queremos a abolição de todos os sindicatos",
    ],
    orange: [
      "Queremos milícias privadas legalizadas para defesa da propriedade",
      "Queremos anistia para todo uso de defensivos de alta toxicidade",
      "Queremos as Reservas Indígenas abertas para mineração",
      "Queremos imunidade legal total para grandes proprietários rurais",
      "Queremos a água urbana desviada para a irrigação das nossas lavouras",
      "Queremos zero licenciamento ambiental para novas fazendas",
      "Queremos o armamento de todos os trabalhadores rurais para autodefesa",
      "Queremos o direito de vender terras a compradores estrangeiros",
      "Queremos a retirada das leis ambientais das fazendas",
    ],
    yellow: [
      "Queremos imunidade legal total para ações policiais em serviço",
      "Queremos a maioridade penal reduzida para 12 anos",
      "Queremos reconhecimento facial total em todos os espaços públicos",
      "Queremos batidas extrajudiciais autorizadas em zonas de conflito",
      "Queremos colônias penais offshore para a cúpula das facções",
      "Queremos identidade digital obrigatória para todo deslocamento público",
      "Queremos as Forças Armadas mobilizadas contra greves e protestos",
      "Queremos uma nota pública de lealdade para cada cidadão",
      "Queremos toda criptografia privada proibida",
    ],
    grey: [
      'Queremos toda "ideologia de gênero" banida das bibliotecas públicas',
      "Queremos educação religiosa obrigatória em todas as escolas",
      "Queremos toda forma de aborto criminalizada sem exceção",
      "Queremos as artes laicas sem verba para proteger nossa herança",
      "Queremos oração obrigatória antes de cada sessão legislativa",
      "Queremos um imposto sobre casais sem filhos para financiar famílias numerosas",
      "Queremos a saída de todos os tratados internacionais",
      "Queremos o casamento restrito à união religiosa",
      'Queremos toda mídia "antitradição" censurada',
    ],
  },

  pivotDemands: [
    "Tô só cansado de política",
    "No final, são todos iguais",
    "Decido na manhã da eleição",
  ],

  grantDemands: [
    "Eu falo pelos dez mil do chão de fábrica",
    "Minha empresa move os mercados que você só lê na manchete",
    "Minha bênção pesa mais que suas leis",
    "Ordem não é sugestão; é o meu mandato",
    "A terra estava aqui antes de você; eu sou a voz dela",
    "A história vai te julgar pelo modo como trata o meu povo",
    "As câmeras me seguem, não os seus discursos",
    "Eu controlo os dados; já sei como eles vão votar",
    "O sobrenome da minha família está em cada prédio desta cidade",
    "Eu não escolho lados; escolho vencedores",
  ],

  exitPollDemand: "As urnas se fecharam — uma última rodada antes da apuração",

  pivotLabel: "Indeciso",
  grantLabel: "Aliado",
  exitPollLabel: "Boca de Urna",

  headlineTemplates: {
    red: {
      spark: "Panfletos sindicais começam a circular pelos {segment}",
      movement: "Um chamado por solidariedade ecoa nos {segment}",
      friction: "Os {segment} exigem negociaçoes trabalhistas",
    },
    purple: {
      spark: "{segment} se mobilizam por uma marcha por igualdade",
      movement:
        "Um manifesto por mudança sistêmica ganha tração com os {segment}",
      friction:
        "Demandas por reformas radicais acendem o debate com os {segment}",
    },
    green: {
      spark: "A urgência ecológica reformula a conversa com {segment}",
      movement: "{segment} pedem ação climática imediata",
      friction:
        "Metas de transição verde ganham o centro do palco com {segment}",
    },
    blue: {
      spark: "Investidores miram {segment} para novos pilotos de desregulação",
      movement: "A linguagem da disciplina fiscal domina os {segment}",
      friction:
        "Forças de mercado se movem para reorganizar as prioridades dos {segment}",
    },
    orange: {
      spark: "O lobby do agro afirma seu poder sobre os {segment}",
      movement:
        "O crescimento puxado pela exportação vira o novo foco com os {segment}",
      friction:
        "Demandas pela ampliação dos direitos de propriedade se intensificam com os {segment}",
    },
    yellow: {
      spark: "Apelos por ordem levam ao reforço do policiamento com {segment}",
      movement:
        "Uma nova onda por segurança pública reformulada pelos {segment}",
      friction:
        "Medidas de vigilância são propostas para proteger os {segment}",
    },
    grey: {
      spark: "{segment} pedem o retorno à herança cultural tradicional",
      movement:
        "Valores tradicionalistas ganham terreno entre os mais velhos dos {segment}",
      friction: "Um movimento por continuidade cultural se firma nos {segment}",
    },
    pivot: {
      spark:
        "Um silêncio pesado entre os {segment} enquanto os eleitores continuam indecisos",
      movement:
        'O "Centro Silencioso":  Muitos dos {segment} permanecem neutros.',
      friction: "Indecisos: {segment} buscam um motivo para se importar",
    },
    grant: {
      spark: "Um articulador local empresta seu peso aos {segment}",
      movement:
        "A estabilidade institucional cresce com a entrada de um Aliado dos {segment}",
      friction:
        "Uma figura respeitada entre os {segment} legitima o clima atual",
    },
  },

  segmentLabels: {
    industrial: "Trabalhadores Industriais",
    urban: "Profissionais Urbanos",
    agricultural: "Produtores Agrícolas",
    financial: "Agentes Financeiros",
    periphery: "Moradores da Periferia",
  },

  singleTitles: {
    red: "Campeão dos Trabalhadores",
    purple: "Revolucionário Social",
    green: "Eco-Radical",
    blue: "Arquiteto do Mercado",
    orange: "Autocrata Rural",
    yellow: "Prefeito de Ferro",
    grey: "Patriarca/Matriarca da Tradição",
  },

  dualTitles: {
    "blue+green": "Tecno-Ambientalista",
    "blue+grey": "Aristocracia do Dinheiro Velho",
    "blue+orange": "Magnata da Exportação",
    "blue+purple": "Reformista Liberal",
    "blue+red": "Capitalista de Estado",
    "blue+yellow": "Falcão Fiscal",
    "green+grey": "Conservacionista Sagrado",
    "green+orange": "Plantador Sustentável",
    "green+purple": "Guardião Progressista",
    "green+red": "Sindicalista Verde",
    "green+yellow": "Guarda Ecológico",
    "grey+orange": "Colhedor Tradicional",
    "grey+purple": "Reformador Moral",
    "grey+red": "Trabalhador Nacionalista",
    "grey+yellow": "Sentinela Divina",
    "orange+purple": "Libertador Agrário",
    "orange+red": "Trabalhador Rural",
    "orange+yellow": "Defensor da Fronteira",
    "purple+red": "Vanguarda Socialista",
    "purple+yellow": "Guardião Inclusivo",
    "red+yellow": "Sindicalista da Ordem",
  },

  tripleTitles: {
    "blue+green+grey": "Guardião do Patrimônio Sustentável",
    "blue+green+orange": "Gestor da Soberania dos Recursos",
    "blue+green+purple": "Visionário da Era Tecno-Equitativa",
    "blue+green+red": "Estrategista da Economia Sustentável",
    "blue+green+yellow": "Operador do Mercado Verde Estratégico",
    "blue+grey+orange": "Patrono da Aristocracia Latifundiária",
    "blue+grey+purple": "Estadista do Establishment Civil",
    "blue+grey+red": "Âncora do Núcleo Institucional",
    "blue+grey+yellow": "Homem-Forte do Pacto Capital-Ordem",
    "blue+orange+purple": "Articulador da Reforma do Comércio Global",
    "blue+orange+red": "Diretor do Complexo Industrial-Agrário",
    "blue+orange+yellow": "Arquiteto da Fortaleza Exportadora",
    "blue+purple+red": "Mediador do Estado de Bem-Estar Moderno",
    "blue+purple+yellow": "Reformador da Guarda Constitucional",
    "blue+red+yellow": "Sentinela da Produtividade Nacional",
    "green+grey+orange": "Pastor do Solo Sagrado",
    "green+grey+purple": "Guardião do Legado Pluralista",
    "green+grey+red": "Zelador da Terra Ancestral",
    "green+grey+yellow": "Executor da Tradição Ecológica",
    "green+orange+purple": "Libertador da Colheita Compartilhada",
    "green+orange+red": "Campeão da Aliança Rural-Verde",
    "green+orange+yellow": "Batedor da Fronteira Ambiental",
    "green+purple+red": "Arquiteto do Pacto Socioambiental",
    "green+purple+yellow": "Protetor da Transição Segura",
    "green+red+yellow": "Comandante da Defesa Ecológica",
    "grey+orange+purple": "Representante do Interior Diverso",
    "grey+orange+red": "Ícone do Sertão dos Trabalhadores",
    "grey+orange+yellow": "Grão-Mestre do Interior Conservador",
    "grey+purple+red": "Líder da Unidade da Frente Nacional",
    "grey+purple+yellow": "Voz da Maioria Moral",
    "grey+red+yellow": "Soberano dos Trabalhadores Patriotas",
    "orange+purple+red": "Voz do Coração Popular",
    "orange+purple+yellow": "Escudo das Comunidades de Fronteira",
    "orange+red+yellow": "Comandante da Defesa Rural-Trabalhista",
    "purple+red+yellow": "Guardião da Paz Inclusiva",
  },

  unclassifiedLeaderTitle: "Líder Inclassificável",
  reluctantCandidateTitle: "Candidato Relutante",

  ambientHeadlines: [
    "Os sete blocos se reúnem — começa a temporada de coalizões",
    "Redação em alerta enquanto os candidatos tomam a palavra",
    "A capital se mexe com a abertura da campanha",
    "Pelo país, postulantes preparam suas plataformas",
    "Estrategistas se reúnem nos bastidores; o tabuleiro se forma",
    "Faixas estendidas — a temporada de campanha está aberta",
    "Coletivas marcadas; candidatos afinam o discurso",
    "Caravanas dão a partida e a estrada da campanha ganha vida",
  ],

  readyTemplates: [
    "{name} lança a campanha",
    "{name} entra na estrada da campanha",
    "{name} entra na disputa",
    "{name} abre o comitê",
    "{name} registra a candidatura",
    "{name} dá o pontapé na campanha",
    "{name} finca a bandeira",
  ],

  openingHeadlines: [
    "Urnas abertas — começa a temporada de coalizões",
    "Os sete blocos se reúnem para a corrida pelo mandato",
    "Redação em alerta enquanto os candidatos tomam a palavra",
    "Primeira batida do martelo — abre o sino da corrida pela coalizão",
    "A capital se mexe com a abertura da campanha",
  ],

  nextVariations: [
    "É a vez de {name}",
    "Próximo no plenário: {name}",
    "A redação aguarda {name}",
    "{name} no relógio",
    "Todos os olhos em {name}",
    "{name} sobe à tribuna",
    "A câmara se volta para {name}",
    "As câmeras rolam para {name}",
    "A imprensa se debruça enquanto {name} delibera",
    "{name} segura o microfone",
    "A agência aguarda {name}",
    "{name} pondera a próxima jogada",
    "{name} toma o púlpito",
    "Repórteres cercam {name}",
    "{name} pesa as opções",
  ],

  finalRoundMessage: "Esta é a rodada final",

  newsroomChip: "Plantão",

  candidateFallback: "Candidato {id}",
};

export default ptBR;
