package marketplace.nilrow.utils;

import marketplace.nilrow.domain.catalog.Catalog;
import marketplace.nilrow.domain.catalog.OperatingHours;
import marketplace.nilrow.domain.catalog.OperatingHoursType;
import marketplace.nilrow.domain.catalog.TimeInterval;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;

public class OperatingHoursUtils {

    /**
     * Verifica se o catálogo está aberto no dia atual.
     *
     * @param catalog o catálogo a ser verificado
     * @return true se estiver aberto; false caso contrário
     */
    public static boolean isCatalogOpen(Catalog catalog) {
        if (catalog == null || catalog.getOperatingHoursType() == null) {
            return false;
        }

        // Primeiro, checamos o tipo global de horário
        switch (catalog.getOperatingHoursType()) {
            case NO_NORMAL_HOURS:
                // Aberto sem um horário fixo – considera-se aberto.
                return true;
            case TEMPORARILY_CLOSED:
            case PERMANENTLY_CLOSED:
                return false;
            case NORMAL_HOURS:
                // Continua para avaliação dos detalhes do dia atual
                break;
            default:
                return false;
        }

        // Determina o dia da semana atual no formato esperado (Português)
        String currentDay = getCurrentDayInPortuguese();

        // Procura a configuração de horários para o dia atual
        OperatingHours todayHours = catalog.getOperatingHours().stream()
                .filter(oh -> oh.getDayOfWeek().equalsIgnoreCase(currentDay))
                .findFirst()
                .orElse(null);

        // Se não houver configuração para hoje, assume que está fechado
        if (todayHours == null) {
            return false;
        }

        // Se o dia estiver marcado como fechado, retorna false
        if (todayHours.isClosed()) {
            return false;
        }

        // Se estiver aberto 24 horas, retorna true
        if (todayHours.is24Hours()) {
            return true;
        }

        // Agora, verifica os intervalos definidos para o dia
        LocalTime now = LocalTime.now();
        return todayHours.getTimeIntervals().stream().anyMatch(ti -> {
            LocalTime openTime = LocalTime.parse(ti.getOpenTime());
            LocalTime closeTime = LocalTime.parse(ti.getCloseTime());
            // Verifica se o horário atual está entre o horário de abertura e fechamento.
            // Nota: esse exemplo assume que os intervalos não cruzam a meia-noite.
            return !now.isBefore(openTime) && !now.isAfter(closeTime);
        });
    }

    /**
     * Converte o dia da semana atual para o formato em português esperado.
     * Ex.: MONDAY -> "Segunda", TUESDAY -> "Terça", etc.
     *
     * @return o dia da semana em português
     */
    private static String getCurrentDayInPortuguese() {
        DayOfWeek dayOfWeek = LocalDate.now().getDayOfWeek();
        switch (dayOfWeek) {
            case MONDAY:
                return "Segunda";
            case TUESDAY:
                return "Terça";
            case WEDNESDAY:
                return "Quarta";
            case THURSDAY:
                return "Quinta";
            case FRIDAY:
                return "Sexta";
            case SATURDAY:
                return "Sábado";
            case SUNDAY:
                return "Domingo";
            default:
                return "";
        }
    }
}
