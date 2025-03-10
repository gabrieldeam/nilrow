package marketplace.nilrow.domain.catalog.location;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO que chega/vai para o front.
 * - position é só [lat, lon] simples
 * - includedPolygons e excludedPolygons são listas de polígonos,
 *   onde cada polígono é uma lista de [lat, lon].
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LocationDTO {
    private String id;
    private String name;
    private List<Double> position;
    private String action;

    // Cada polígono: List<List<Double>> => [ [lat,lon], [lat,lon], ... ]
    private List<List<List<Double>>> includedPolygons;
    private List<List<List<Double>>> excludedPolygons;
}
