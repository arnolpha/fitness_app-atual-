export interface LibraryExercise {
  name: string;
  category: string;
  muscle: string;
  difficulty: string;
  equipment: string;
}

export const exerciseLibrary: LibraryExercise[] = [
  // PEITO
  { name: 'Supino Reto', category: 'Peito', muscle: 'Peitoral maior', difficulty: 'Intermediario', equipment: 'Barra' },
  { name: 'Supino Inclinado', category: 'Peito', muscle: 'Peitoral superior', difficulty: 'Intermediario', equipment: 'Barra' },
  { name: 'Supino Declinado', category: 'Peito', muscle: 'Peitoral inferior', difficulty: 'Intermediario', equipment: 'Barra' },
  { name: 'Supino Reto com Halteres', category: 'Peito', muscle: 'Peitoral maior', difficulty: 'Intermediario', equipment: 'Halteres' },
  { name: 'Supino Inclinado com Halteres', category: 'Peito', muscle: 'Peitoral superior', difficulty: 'Intermediario', equipment: 'Halteres' },
  { name: 'Crucifixo Reto', category: 'Peito', muscle: 'Peitoral maior', difficulty: 'Iniciante', equipment: 'Halteres' },
  { name: 'Crucifixo Inclinado', category: 'Peito', muscle: 'Peitoral superior', difficulty: 'Iniciante', equipment: 'Halteres' },
  { name: 'Peck Deck', category: 'Peito', muscle: 'Peitoral maior', difficulty: 'Iniciante', equipment: 'Maquina' },
  { name: 'Crossover', category: 'Peito', muscle: 'Peitoral maior', difficulty: 'Iniciante', equipment: 'Polia' },
  { name: 'Flexao de Braco', category: 'Peito', muscle: 'Peitoral maior', difficulty: 'Iniciante', equipment: 'Nenhum' },
  { name: 'Mergulho no Paralelo', category: 'Peito', muscle: 'Peitoral inferior', difficulty: 'Intermediario', equipment: 'Nenhum' },
  { name: 'Pull Over', category: 'Peito', muscle: 'Peitoral e Dorsal', difficulty: 'Intermediario', equipment: 'Halteres' },

  // COSTAS
  { name: 'Puxada Frontal', category: 'Costas', muscle: 'Latissimo do dorso', difficulty: 'Iniciante', equipment: 'Polia' },
  { name: 'Puxada por tras', category: 'Costas', muscle: 'Latissimo do dorso', difficulty: 'Intermediario', equipment: 'Polia' },
  { name: 'Remada Curvada', category: 'Costas', muscle: 'Trapezio e romboides', difficulty: 'Intermediario', equipment: 'Barra' },
  { name: 'Remada Unilateral', category: 'Costas', muscle: 'Dorsal e romboides', difficulty: 'Iniciante', equipment: 'Halteres' },
  { name: 'Remada Cavalinho', category: 'Costas', muscle: 'Trapezio medio', difficulty: 'Intermediario', equipment: 'Maquina' },
  { name: 'Remada Sentada', category: 'Costas', muscle: 'Dorsal e romboides', difficulty: 'Iniciante', equipment: 'Polia' },
  { name: 'Levantamento Terra', category: 'Costas', muscle: 'Lombar e isquiotibiais', difficulty: 'Avancado', equipment: 'Barra' },
  { name: 'Barra Fixa', category: 'Costas', muscle: 'Latissimo do dorso', difficulty: 'Avancado', equipment: 'Nenhum' },
  { name: 'Hyperextensao', category: 'Costas', muscle: 'Lombar', difficulty: 'Iniciante', equipment: 'Maquina' },
  { name: 'Remada Invertida', category: 'Costas', muscle: 'Dorsal medio', difficulty: 'Intermediario', equipment: 'Barra' },
  { name: 'Face Pull', category: 'Costas', muscle: 'Deltoides posterior', difficulty: 'Iniciante', equipment: 'Polia' },
  { name: 'Puxada Supinada', category: 'Costas', muscle: 'Latissimo do dorso', difficulty: 'Intermediario', equipment: 'Polia' },

  // OMBRO
  { name: 'Desenvolvimento com Barra', category: 'Ombro', muscle: 'Deltoides anterior', difficulty: 'Intermediario', equipment: 'Barra' },
  { name: 'Desenvolvimento com Halteres', category: 'Ombro', muscle: 'Deltoides', difficulty: 'Intermediario', equipment: 'Halteres' },
  { name: 'Elevacao Lateral', category: 'Ombro', muscle: 'Deltoides lateral', difficulty: 'Iniciante', equipment: 'Halteres' },
  { name: 'Elevacao Frontal', category: 'Ombro', muscle: 'Deltoides anterior', difficulty: 'Iniciante', equipment: 'Halteres' },
  { name: 'Elevacao Lateral na Polia', category: 'Ombro', muscle: 'Deltoides lateral', difficulty: 'Iniciante', equipment: 'Polia' },
  { name: 'Remada Alta', category: 'Ombro', muscle: 'Trapezio e deltoides', difficulty: 'Intermediario', equipment: 'Barra' },
  { name: 'Arnold Press', category: 'Ombro', muscle: 'Deltoides completo', difficulty: 'Intermediario', equipment: 'Halteres' },
  { name: 'Crucifixo Invertido', category: 'Ombro', muscle: 'Deltoides posterior', difficulty: 'Iniciante', equipment: 'Halteres' },
  { name: 'Desenvolvimento na Maquina', category: 'Ombro', muscle: 'Deltoides', difficulty: 'Iniciante', equipment: 'Maquina' },
  { name: 'Encolhimento', category: 'Ombro', muscle: 'Trapezio', difficulty: 'Iniciante', equipment: 'Halteres' },

  // BICEPS
  { name: 'Rosca Direta', category: 'Biceps', muscle: 'Biceps braquial', difficulty: 'Iniciante', equipment: 'Barra' },
  { name: 'Rosca Alternada', category: 'Biceps', muscle: 'Biceps braquial', difficulty: 'Iniciante', equipment: 'Halteres' },
  { name: 'Rosca Martelo', category: 'Biceps', muscle: 'Braquial e braquiorradial', difficulty: 'Iniciante', equipment: 'Halteres' },
  { name: 'Rosca Scott', category: 'Biceps', muscle: 'Biceps braquial', difficulty: 'Iniciante', equipment: 'Maquina' },
  { name: 'Rosca Concentrada', category: 'Biceps', muscle: 'Biceps braquial', difficulty: 'Iniciante', equipment: 'Halteres' },
  { name: 'Rosca na Polia', category: 'Biceps', muscle: 'Biceps braquial', difficulty: 'Iniciante', equipment: 'Polia' },
  { name: 'Rosca 21', category: 'Biceps', muscle: 'Biceps braquial', difficulty: 'Intermediario', equipment: 'Barra' },
  { name: 'Rosca Inversa', category: 'Biceps', muscle: 'Braquiorradial', difficulty: 'Iniciante', equipment: 'Barra' },
  { name: 'Rosca Inclinada', category: 'Biceps', muscle: 'Biceps braquial', difficulty: 'Intermediario', equipment: 'Halteres' },

  // TRICEPS
  { name: 'Triceps Corda', category: 'Triceps', muscle: 'Triceps braquial', difficulty: 'Iniciante', equipment: 'Polia' },
  { name: 'Triceps Testa', category: 'Triceps', muscle: 'Triceps braquial', difficulty: 'Intermediario', equipment: 'Barra' },
  { name: 'Triceps Frances', category: 'Triceps', muscle: 'Triceps braquial', difficulty: 'Intermediario', equipment: 'Halteres' },
  { name: 'Triceps Mergulho', category: 'Triceps', muscle: 'Triceps braquial', difficulty: 'Iniciante', equipment: 'Nenhum' },
  { name: 'Triceps Pulley', category: 'Triceps', muscle: 'Triceps braquial', difficulty: 'Iniciante', equipment: 'Polia' },
  { name: 'Triceps Coice', category: 'Triceps', muscle: 'Triceps braquial', difficulty: 'Iniciante', equipment: 'Halteres' },
  { name: 'Triceps na Maquina', category: 'Triceps', muscle: 'Triceps braquial', difficulty: 'Iniciante', equipment: 'Maquina' },
  { name: 'Supino Fechado', category: 'Triceps', muscle: 'Triceps braquial', difficulty: 'Intermediario', equipment: 'Barra' },
  { name: 'Triceps Unilateral', category: 'Triceps', muscle: 'Triceps braquial', difficulty: 'Iniciante', equipment: 'Polia' },

  // PERNA
  { name: 'Agachamento Livre', category: 'Perna', muscle: 'Quadriceps e gluteos', difficulty: 'Intermediario', equipment: 'Barra' },
  { name: 'Leg Press', category: 'Perna', muscle: 'Quadriceps', difficulty: 'Iniciante', equipment: 'Maquina' },
  { name: 'Cadeira Extensora', category: 'Perna', muscle: 'Quadriceps', difficulty: 'Iniciante', equipment: 'Maquina' },
  { name: 'Cadeira Flexora', category: 'Perna', muscle: 'Isquiotibiais', difficulty: 'Iniciante', equipment: 'Maquina' },
  { name: 'Stiff', category: 'Perna', muscle: 'Isquiotibiais e gluteos', difficulty: 'Intermediario', equipment: 'Barra' },
  { name: 'Agachamento Hack', category: 'Perna', muscle: 'Quadriceps', difficulty: 'Intermediario', equipment: 'Maquina' },
  { name: 'Afundo', category: 'Perna', muscle: 'Quadriceps e gluteos', difficulty: 'Iniciante', equipment: 'Halteres' },
  { name: 'Panturrilha em Pe', category: 'Perna', muscle: 'Gastrocnemio', difficulty: 'Iniciante', equipment: 'Maquina' },
  { name: 'Panturrilha Sentado', category: 'Perna', muscle: 'Soleo', difficulty: 'Iniciante', equipment: 'Maquina' },
  { name: 'Agachamento Sumô', category: 'Perna', muscle: 'Adutores e gluteos', difficulty: 'Iniciante', equipment: 'Halteres' },
  { name: 'Leg Press 45', category: 'Perna', muscle: 'Quadriceps e gluteos', difficulty: 'Iniciante', equipment: 'Maquina' },
  { name: 'Elevacao Pelvica', category: 'Perna', muscle: 'Gluteos', difficulty: 'Iniciante', equipment: 'Barra' },
  { name: 'Adutora', category: 'Perna', muscle: 'Adutores', difficulty: 'Iniciante', equipment: 'Maquina' },
  { name: 'Abducao de Quadril', category: 'Perna', muscle: 'Gluteos e abdutores', difficulty: 'Iniciante', equipment: 'Maquina' },
  { name: 'Mesa Flexora', category: 'Perna', muscle: 'Isquiotibiais', difficulty: 'Iniciante', equipment: 'Maquina' },

  // ABDOMEN
  { name: 'Abdominal Supra', category: 'Abdomen', muscle: 'Reto abdominal', difficulty: 'Iniciante', equipment: 'Nenhum' },
  { name: 'Abdominal Infra', category: 'Abdomen', muscle: 'Reto abdominal inferior', difficulty: 'Iniciante', equipment: 'Nenhum' },
  { name: 'Prancha', category: 'Abdomen', muscle: 'Core', difficulty: 'Iniciante', equipment: 'Nenhum' },
  { name: 'Obliquo', category: 'Abdomen', muscle: 'Obliquos', difficulty: 'Iniciante', equipment: 'Nenhum' },
  { name: 'Abdominal na Polia', category: 'Abdomen', muscle: 'Reto abdominal', difficulty: 'Iniciante', equipment: 'Polia' },
  { name: 'Elevacao de Pernas', category: 'Abdomen', muscle: 'Reto abdominal inferior', difficulty: 'Iniciante', equipment: 'Nenhum' },
  { name: 'Crunch', category: 'Abdomen', muscle: 'Reto abdominal', difficulty: 'Iniciante', equipment: 'Nenhum' },
  { name: 'Abdominal na Maquina', category: 'Abdomen', muscle: 'Reto abdominal', difficulty: 'Iniciante', equipment: 'Maquina' },
  { name: 'Russian Twist', category: 'Abdomen', muscle: 'Obliquos', difficulty: 'Iniciante', equipment: 'Nenhum' },
  { name: 'Abdominal Bicicleta', category: 'Abdomen', muscle: 'Reto abdominal e obliquos', difficulty: 'Iniciante', equipment: 'Nenhum' },

  // CARDIO
  { name: 'Corrida na Esteira', category: 'Cardio', muscle: 'Full body', difficulty: 'Iniciante', equipment: 'Esteira' },
  { name: 'Bicicleta Ergometrica', category: 'Cardio', muscle: 'Membros inferiores', difficulty: 'Iniciante', equipment: 'Maquina' },
  { name: 'Eliptico', category: 'Cardio', muscle: 'Full body', difficulty: 'Iniciante', equipment: 'Maquina' },
  { name: 'Corda', category: 'Cardio', muscle: 'Full body', difficulty: 'Intermediario', equipment: 'Nenhum' },
  { name: 'Caminhada', category: 'Cardio', muscle: 'Membros inferiores', difficulty: 'Iniciante', equipment: 'Nenhum' },
  { name: 'Burpee', category: 'Cardio', muscle: 'Full body', difficulty: 'Avancado', equipment: 'Nenhum' },
  { name: 'Polichinelo', category: 'Cardio', muscle: 'Full body', difficulty: 'Iniciante', equipment: 'Nenhum' },
  { name: 'Remo Ergometrico', category: 'Cardio', muscle: 'Full body', difficulty: 'Intermediario', equipment: 'Maquina' },
];