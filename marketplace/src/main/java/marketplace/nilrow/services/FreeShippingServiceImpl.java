package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.Catalog;
import marketplace.nilrow.domain.catalog.shipping.freeshipping.*;
import marketplace.nilrow.repositories.CatalogRepository;
import marketplace.nilrow.repositories.FreeShippingRepository;
import marketplace.nilrow.util.PolygonUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;
import java.util.Comparator;

@Service
public class FreeShippingServiceImpl implements FreeShippingService {

    @Autowired private FreeShippingRepository freeShippingRepo;
    @Autowired private CatalogRepository catalogRepo;

    // ---------- CRUD principal ----------

    @Override
    public FreeShippingDTO createFreeShipping(FreeShippingDTO dto) {
        FreeShipping saved = freeShippingRepo.save(mapToEntity(dto));
        return mapToDTO(saved);
    }

    @Override
    public FreeShippingDTO updateFreeShipping(String id, FreeShippingDTO dto) {
        FreeShipping fs = freeShippingRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("FreeShipping não encontrado"));
        fs.setActive(dto.isActive());
        return mapToDTO(freeShippingRepo.save(fs));
    }

    @Override
    public FreeShippingDTO getFreeShippingById(String id) {
        return mapToDTO(freeShippingRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("FreeShipping não encontrado")));
    }

    @Override
    public FreeShippingDTO getFreeShippingByCatalogId(String catalogId) {
        return freeShippingRepo.findByCatalogId(catalogId)
                .map(this::mapToDTO)
                .orElse(null);
    }

    @Override
    public List<FreeShippingDTO> getAllFreeShippings() {
        return freeShippingRepo.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteFreeShipping(String id) {
        freeShippingRepo.deleteById(id);
    }

    // ---------- Radii ----------

    @Transactional
    @Override
    public FreeShippingDTO addFreeShippingRadius(String fsId, FreeShippingRadiusDTO dto) {
        FreeShipping fs = freeShippingRepo.findById(fsId)
                .orElseThrow(() -> new RuntimeException("FreeShipping não encontrado"));
        if (fs.getRadii() == null) fs.setRadii(new ArrayList<>());

        FreeShippingRadius radius = mapRadiusToEntity(dto, fs);
        fs.getRadii().add(radius);

        return mapToDTO(freeShippingRepo.save(fs));
    }

    @Transactional
    @Override
    public FreeShippingDTO updateFreeShippingRadius(String fsId, FreeShippingRadiusDTO dto) {
        FreeShipping fs = freeShippingRepo.findById(fsId)
                .orElseThrow(() -> new RuntimeException("FreeShipping não encontrado"));

        FreeShippingRadius radius = fs.getRadii().stream()
                .filter(r -> r.getId().equals(dto.getId()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Raio não encontrado"));

        radius.setRadius(dto.getRadius());
        radius.setMinCartValue(dto.getMinCartValue());

        // coordenadas
        List<FreeShippingCoordinate> newCoords = updateCoordinates(radius, dto.getCoordinates());
        if (radius.getCoordinates() != null) {
            radius.getCoordinates().clear();
            radius.getCoordinates().addAll(newCoords);
        } else {
            radius.setCoordinates(newCoords);
        }

        return mapToDTO(freeShippingRepo.save(fs));
    }

    @Transactional
    @Override
    public FreeShippingDTO deleteFreeShippingRadius(String fsId, String radiusId) {
        FreeShipping fs = freeShippingRepo.findById(fsId)
                .orElseThrow(() -> new RuntimeException("FreeShipping não encontrado"));
        fs.getRadii().removeIf(r -> r.getId().equals(radiusId));
        return mapToDTO(freeShippingRepo.save(fs));
    }

    // ---------- Verificação de elegibilidade ----------

    @Override
    public FreeShippingAvailabilityDTO checkFreeShipping(String catalogId,
                                                         BigDecimal cartTotal,
                                                         double lat,
                                                         double lon) {

        FreeShipping fs = freeShippingRepo.findByCatalogId(catalogId)
                .orElseThrow(() -> new RuntimeException("FreeShipping não configurado"));

        if (!fs.isActive()) return new FreeShippingAvailabilityDTO(false, BigDecimal.ZERO);

        // 1️⃣  Filtra apenas os raios que contêm o ponto
        List<FreeShippingRadius> areaRadii = fs.getRadii().stream()
                .filter(r -> r.getCoordinates() != null && !r.getCoordinates().isEmpty()
                        && PolygonUtils.isPointInPolygon(lat, lon, r.getCoordinates()))
                .toList();

        if (areaRadii.isEmpty())
            return new FreeShippingAvailabilityDTO(false, BigDecimal.ZERO);   // fora da área

        // 2️⃣  Verifica se algum raio atinge o valor mínimo
        Optional<FreeShippingRadius> eligible = areaRadii.stream()
                .filter(r -> cartTotal.compareTo(r.getMinCartValue()) >= 0)
                .min(Comparator.comparingDouble(FreeShippingRadius::getRadius));

        if (eligible.isPresent())
            return new FreeShippingAvailabilityDTO(true, BigDecimal.ZERO);

        // 3️⃣  Calcula o menor valor faltante dentre os raios aplicáveis
        BigDecimal missing = areaRadii.stream()
                .map(r -> r.getMinCartValue().subtract(cartTotal))
                .filter(m -> m.compareTo(BigDecimal.ZERO) > 0)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        return new FreeShippingAvailabilityDTO(false, missing);
    }


    // ---------- Helpers de mapeamento ----------

    private List<FreeShippingCoordinate> updateCoordinates(FreeShippingRadius radius,
                                                           List<FreeShippingCoordinateDTO> coordDTOs) {
        List<FreeShippingCoordinate> list = new ArrayList<>();
        if (coordDTOs != null) {
            for (FreeShippingCoordinateDTO dto : coordDTOs) {
                FreeShippingCoordinate c = new FreeShippingCoordinate();
                c.setFreeShippingRadius(radius);
                c.setLatitude(dto.getLatitude());
                c.setLongitude(dto.getLongitude());
                list.add(c);
            }
        }
        return list;
    }

    private FreeShippingDTO mapToDTO(FreeShipping fs) {
        FreeShippingDTO dto = new FreeShippingDTO();
        dto.setId(fs.getId());
        dto.setCatalogId(fs.getCatalog().getId());
        dto.setActive(fs.isActive());

        if (fs.getRadii() != null) {
            dto.setRadii(fs.getRadii().stream()
                    .map(this::mapRadiusToDTO)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    private FreeShippingRadiusDTO mapRadiusToDTO(FreeShippingRadius r) {
        FreeShippingRadiusDTO dto = new FreeShippingRadiusDTO();
        dto.setId(r.getId());
        dto.setRadius(r.getRadius());
        dto.setMinCartValue(r.getMinCartValue());

        if (r.getCoordinates() != null) {
            dto.setCoordinates(r.getCoordinates().stream()
                    .map(this::mapCoordinateToDTO)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    private FreeShippingCoordinateDTO mapCoordinateToDTO(FreeShippingCoordinate c) {
        return new FreeShippingCoordinateDTO(c.getId(), c.getLatitude(), c.getLongitude());
    }

    private FreeShipping mapToEntity(FreeShippingDTO dto) {
        FreeShipping fs = new FreeShipping();
        fs.setActive(dto.isActive());

        Catalog cat = catalogRepo.findById(dto.getCatalogId())
                .orElseThrow(() -> new RuntimeException("Catálogo não encontrado"));
        fs.setCatalog(cat);

        if (dto.getRadii() != null) {
            fs.setRadii(dto.getRadii().stream()
                    .map(r -> mapRadiusToEntity(r, fs))
                    .collect(Collectors.toList()));
        }
        return fs;
    }

    private FreeShippingRadius mapRadiusToEntity(FreeShippingRadiusDTO dto, FreeShipping fs) {
        FreeShippingRadius r = new FreeShippingRadius();
        r.setFreeShipping(fs);
        r.setRadius(dto.getRadius());
        r.setMinCartValue(dto.getMinCartValue());

        if (dto.getCoordinates() != null) {
            r.setCoordinates(dto.getCoordinates().stream()
                    .map(c -> mapCoordinateToEntity(c, r))
                    .collect(Collectors.toList()));
        }
        return r;
    }

    private FreeShippingCoordinate mapCoordinateToEntity(FreeShippingCoordinateDTO dto,
                                                         FreeShippingRadius r) {
        FreeShippingCoordinate c = new FreeShippingCoordinate();
        c.setFreeShippingRadius(r);
        c.setLatitude(dto.getLatitude());
        c.setLongitude(dto.getLongitude());
        return c;
    }
}
