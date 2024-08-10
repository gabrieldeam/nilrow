package marketplace.nilrow.domain.catalog;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CatalogDTO {
    private String id;
    private String name;
    private String nameBoss;
    private String cnpj;
    private String email;
    private String phone;
    private String addressId;

    @JsonProperty("operatingHoursType")
    private OperatingHoursType operatingHoursType;

    private List<OperatingHoursDTO> operatingHours;
}
