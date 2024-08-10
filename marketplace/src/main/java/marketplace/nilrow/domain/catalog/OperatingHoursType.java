package marketplace.nilrow.domain.catalog;

public enum OperatingHoursType {
    NO_NORMAL_HOURS("Aberto sem horário normal"),
    TEMPORARILY_CLOSED("Temporariamente fechado"),
    PERMANENTLY_CLOSED("Permanentemente fechado"),
    NORMAL_HOURS("Aberto com horário normal");

    private final String description;

    OperatingHoursType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
