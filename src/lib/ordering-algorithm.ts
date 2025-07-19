import { EnhancedSample, OrderingConfiguration, OrderingCriterion, SampleScore, OrderingResult } from '@/types/ordering';

export class SampleOrderingEngine {
  /**
   * Algoritmo principal de ordenação de amostras
   */
  static orderSamples(
    samples: EnhancedSample[],
    configuration: OrderingConfiguration,
    sessionId: string,
    userId: string
  ): OrderingResult {
    // 1. Validar entrada
    this.validateInputs(samples, configuration);

    // 2. Calcular scores para cada amostra
    const scores = samples.map(sample => 
      this.calculateSampleScore(sample, configuration.criteria)
    );

    // 3. Ordenar por score total
    const sortedScores = scores.sort((a, b) => b.totalScore - a.totalScore);

    // 4. Aplicar posições finais
    sortedScores.forEach((score, index) => {
      score.finalPosition = index + 1;
    });

    // 5. Ordenar amostras baseado nos scores
    const orderedSamples = sortedScores.map(score => 
      samples.find(sample => sample.id === score.sampleId)!
    );

    return {
      configurationId: configuration.id,
      sessionId,
      orderedSamples,
      scores: sortedScores,
      appliedAt: new Date().toISOString(),
      generatedBy: userId
    };
  }

  /**
   * Calcula o score total de uma amostra baseado nos critérios
   */
  private static calculateSampleScore(
    sample: EnhancedSample,
    criteria: OrderingCriterion[]
  ): SampleScore {
    const activeCriteria = criteria.filter(c => c.isActive);
    const totalWeight = activeCriteria.reduce((sum, c) => sum + c.weight, 0);

    if (totalWeight === 0) {
      throw new Error('Pelo menos um critério deve estar ativo com peso > 0');
    }

    const criteriaScores = activeCriteria.map(criterion => {
      const rawValue = this.extractValue(sample, criterion.dataPath);
      const normalizedValue = this.normalizeValue(rawValue, criterion);
      const weightedScore = (normalizedValue * criterion.weight) / totalWeight;

      return {
        criterionId: criterion.id,
        rawValue,
        normalizedValue,
        weightedScore
      };
    });

    const totalScore = criteriaScores.reduce((sum, cs) => sum + cs.weightedScore, 0);

    return {
      sampleId: sample.id,
      totalScore,
      criteriaScores,
      finalPosition: 0 // Será definido posteriormente
    };
  }

  /**
   * Extrai valor de uma propriedade aninhada do objeto
   */
  private static extractValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  /**
   * Normaliza valores para escala 0-100 baseado no tipo e configuração
   */
  private static normalizeValue(value: any, criterion: OrderingCriterion): number {
    if (value === null || value === undefined) {
      return criterion.normalizationConfig?.defaultValue || 0;
    }

    let normalized = 0;

    switch (criterion.type) {
      case 'numeric':
        normalized = this.normalizeNumeric(value, criterion);
        break;
      case 'date':
        normalized = this.normalizeDate(value, criterion);
        break;
      case 'enum':
        normalized = this.normalizeEnum(value, criterion);
        break;
      case 'boolean':
        normalized = value ? 100 : 0;
        break;
      default:
        normalized = 0;
    }

    // Aplicar direção (inverter se decrescente)
    return criterion.direction === 'desc' ? 100 - normalized : normalized;
  }

  /**
   * Normalização para valores numéricos
   */
  private static normalizeNumeric(value: number, criterion: OrderingCriterion): number {
    const config = criterion.normalizationConfig;
    if (!config || config.min === undefined || config.max === undefined) {
      return Math.min(100, Math.max(0, value));
    }

    const { min, max } = config;
    if (max === min) return 50; // Evitar divisão por zero

    return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  }

  /**
   * Normalização para datas (mais recente = maior score)
   */
  private static normalizeDate(value: string, criterion: OrderingCriterion): number {
    const date = new Date(value);
    const now = new Date();
    const config = criterion.normalizationConfig;

    // Usar configuração personalizada ou padrão (30 dias)
    const maxDaysOld = config?.max || 30;
    const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 0) return 100; // Data futura ou hoje
    if (daysDiff >= maxDaysOld) return 0; // Muito antiga

    return Math.max(0, 100 - (daysDiff / maxDaysOld) * 100);
  }

  /**
   * Normalização para valores enum baseado na posição na lista
   */
  private static normalizeEnum(value: string, criterion: OrderingCriterion): number {
    const options = criterion.options || [];
    const index = options.indexOf(value);
    
    if (index === -1) return 0; // Valor não encontrado
    if (options.length === 1) return 100;

    return (index / (options.length - 1)) * 100;
  }

  /**
   * Validações de entrada
   */
  private static validateInputs(samples: EnhancedSample[], configuration: OrderingConfiguration): void {
    if (!samples || samples.length === 0) {
      throw new Error('Lista de amostras não pode estar vazia');
    }

    if (!configuration || !configuration.criteria) {
      throw new Error('Configuração de ordenação inválida');
    }

    const activeCriteria = configuration.criteria.filter(c => c.isActive);
    if (activeCriteria.length === 0) {
      throw new Error('Pelo menos um critério deve estar ativo');
    }

    // Validar pesos
    const invalidWeights = activeCriteria.filter(c => c.weight < 1 || c.weight > 100);
    if (invalidWeights.length > 0) {
      throw new Error('Todos os pesos devem estar entre 1 e 100');
    }
  }

  /**
   * Gera preview da ordenação sem persistir
   */
  static generatePreview(
    samples: EnhancedSample[],
    criteria: OrderingCriterion[]
  ): { sample: EnhancedSample; score: number; position: number }[] {
    try {
      const tempConfig: OrderingConfiguration = {
        id: 'preview',
        name: 'Preview',
        description: 'Preview temporário',
        criteria,
        isDefault: false,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = this.orderSamples(samples, tempConfig, 'preview', 'system');
      
      return result.orderedSamples.map((sample, index) => ({
        sample,
        score: result.scores.find(s => s.sampleId === sample.id)?.totalScore || 0,
        position: index + 1
      }));
    } catch (error) {
      console.error('Erro ao gerar preview:', error);
      return samples.map((sample, index) => ({
        sample,
        score: 0,
        position: index + 1
      }));
    }
  }
}