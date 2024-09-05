package marketplace.nilrow.domain.catalog.location;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationDTO {

    private String id;
    private String name;
    private List<Double> position;
    private List<List<List<Double>>> includedPolygons;
    private List<List<List<Double>>> excludedPolygons;
    private String action;

}
