package marketplace.nilrow.domain.catalog;

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
    private OperatingHoursType operatingHoursType; // Usando o enum aqui
    private List<OperatingHoursDTO> operatingHours; // Lista de horários de funcionamento
}
