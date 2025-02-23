package marketplace.nilrow.util;

import marketplace.nilrow.domain.catalog.Catalog;
import marketplace.nilrow.domain.catalog.OperatingHours;
import marketplace.nilrow.domain.catalog.TimeInterval;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

public class OperatingHoursUtils {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    /**
     * Verifica se o catálogo está aberto no horário 'now' para o dia 'currentDay'
     * (em formato português, por exemplo: "Segunda", "Terça", etc.).
     */
    public static boolean isCatalogOpen(Catalog catalog, LocalTime now, String currentDay) {
        if (catalog.getOperatingHours() == null) {
            // Se não houver horários definidos, assumimos que está aberto
            return true;
        }
        for (OperatingHours oh : catalog.getOperatingHours()) {
            if (oh.getDayOfWeek().equalsIgnoreCase(currentDay)) {
                if (oh.isClosed()) {
                    return false;
                }
                if (oh.is24Hours()) {
                    return true;
                }
                if (oh.getTimeIntervals() != null) {
                    for (TimeInterval ti : oh.getTimeIntervals()) {
                        LocalTime open = LocalTime.parse(ti.getOpenTime(), TIME_FORMATTER);
                        LocalTime close = LocalTime.parse(ti.getCloseTime(), TIME_FORMATTER);
                        // Verifica se 'now' está dentro do intervalo (assumindo que open e close são do mesmo dia)
                        if (!now.isBefore(open) && now.isBefore(close)) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    /**
     * Converte o DayOfWeek para o nome em português, conforme o que está armazenado no catálogo.
     */
    public static String getPortugueseDayName(java.time.DayOfWeek dayOfWeek) {
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
