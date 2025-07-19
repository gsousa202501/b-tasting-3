import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Clock, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';
import { SessionFormData } from '@/types';
import { cn } from '@/lib/utils';

interface SessionDataStepProps {
  data: SessionFormData['sessionData'];
  onChange: (data: SessionFormData['sessionData']) => void;
}

export function SessionDataStep({ data, onChange }: SessionDataStepProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (data.startDate && data.endDate) {
      return {
        from: new Date(data.startDate),
        to: new Date(data.endDate)
      };
    }
    return undefined;
  });

  const updateField = (field: keyof SessionFormData['sessionData'], value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from) {
      updateField('startDate', format(range.from, 'yyyy-MM-dd'));
    } else {
      updateField('startDate', '');
    }
    
    if (range?.to) {
      updateField('endDate', format(range.to, 'yyyy-MM-dd'));
    } else {
      updateField('endDate', '');
    }
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-beer-dark">
            <Settings className="h-5 w-5" />
            Informações Básicas da Sessão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-name">Nome da Sessão *</Label>
            <Input
              id="session-name"
              placeholder="Ex: Controle de Qualidade Semanal"
              value={data.name}
              onChange={(e) => updateField('name', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="session-date">Data da Sessão *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="session-date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !data.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {data.date ? (
                      format(new Date(data.date), 'dd/MM/yyyy', { locale: ptBR })
                    ) : (
                      "Selecione a data"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={data.date ? new Date(data.date) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        updateField('date', format(date, 'yyyy-MM-dd'));
                      }
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="session-time">Horário da Sessão *</Label>
              <Select value={data.time} onValueChange={(value) => updateField('time', value)}>
                <SelectTrigger>
                  <Clock className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Selecione o horário" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-type">Tipo de Sessão *</Label>
            <Select value={data.type} onValueChange={(value: 'routine' | 'extra') => updateField('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="routine">Rotina</SelectItem>
                <SelectItem value="extra">Extra</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-beer-dark">Filtros para Busca de Amostras (Opcional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Período de Produção das Amostras</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })} -{' '}
                        {format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })}
                      </>
                    ) : (
                      format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })
                    )
                  ) : (
                    "Selecione o período"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleDateRangeChange}
                  numberOfMonths={2}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Estes filtros serão aplicados na busca de amostras no próximo passo.
            {dateRange?.from && dateRange?.to && (
              <span className="block mt-1 text-beer-dark font-medium">
                Período selecionado: {format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })} até {format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })}
              </span>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}