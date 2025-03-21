package marketplace.nilrow.services;

import marketplace.nilrow.domain.catalog.shipping.pickup.Pickup;
import marketplace.nilrow.domain.catalog.shipping.pickup.PickupDTO;
import marketplace.nilrow.repositories.PickupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PickupService {

    @Autowired
    private PickupRepository pickupRepository;

    // Converte a entidade para DTO
    private PickupDTO convertToDTO(Pickup pickup) {
        PickupDTO dto = new PickupDTO();
        dto.setId(pickup.getId().toString());
        dto.setCatalogId(pickup.getCatalog().getId().toString());
        dto.setActive(pickup.isActive());
        dto.setPrazoRetirada(pickup.getPrazoRetirada());
        dto.setPrecoRetirada(pickup.getPrecoRetirada());
        return dto;
    }

    // Converte o DTO para entidade
    // Obs.: É necessário buscar o objeto Catalog correspondente ao catalogId (não incluído neste exemplo)
    private Pickup convertToEntity(PickupDTO dto) {
        Pickup pickup = new Pickup();
        // Supondo que a busca do Catalog já esteja implementada ou o objeto seja setado de outra forma
        // Exemplo: pickup.setCatalog(catalogService.findById(Long.parseLong(dto.getCatalogId())));
        pickup.setActive(dto.isActive());
        pickup.setPrazoRetirada(dto.getPrazoRetirada());
        pickup.setPrecoRetirada(dto.getPrecoRetirada());
        return pickup;
    }

    public List<PickupDTO> findAll() {
        List<Pickup> pickups = pickupRepository.findAll();
        return pickups.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public PickupDTO findById(String id) {
        Optional<Pickup> opt = pickupRepository.findById(id);
        if(opt.isPresent()){
            return convertToDTO(opt.get());
        }
        throw new RuntimeException("Pickup não encontrada com id: " + id);
    }

    public PickupDTO create(PickupDTO dto) {
        Pickup pickup = convertToEntity(dto);
        // Aqui você pode buscar e setar o Catalog a partir do catalogId do DTO
        Pickup saved = pickupRepository.save(pickup);
        return convertToDTO(saved);
    }

    public PickupDTO update(String id, PickupDTO dto) {
        Optional<Pickup> opt = pickupRepository.findById(id);
        if(opt.isPresent()){
            Pickup pickup = opt.get();
            // Atualiza os campos desejados
            pickup.setActive(dto.isActive());
            pickup.setPrazoRetirada(dto.getPrazoRetirada());
            pickup.setPrecoRetirada(dto.getPrecoRetirada());
            // Se necessário, atualize também o Catalog (buscando pelo dto.getCatalogId())
            Pickup updated = pickupRepository.save(pickup);
            return convertToDTO(updated);
        }
        throw new RuntimeException("Pickup não encontrada com id: " + id);
    }

    public void delete(String id) {
        if(pickupRepository.existsById(id)){
            pickupRepository.deleteById(id);
        } else {
            throw new RuntimeException("Pickup não encontrada com id: " + id);
        }
    }
}