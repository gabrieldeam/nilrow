package marketplace.nilrow.services;

import marketplace.nilrow.domain.address.AddressDTO;
import marketplace.nilrow.domain.catalog.Catalog;
import marketplace.nilrow.domain.catalog.shipping.pickup.Pickup;
import marketplace.nilrow.domain.catalog.shipping.pickup.PickupActiveDetailsDTO;
import marketplace.nilrow.domain.catalog.shipping.pickup.PickupDTO;
import marketplace.nilrow.repositories.CatalogRepository;
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

    @Autowired
    private CatalogRepository catalogRepository;

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
    private Pickup convertToEntity(PickupDTO dto) {
        Pickup pickup = new Pickup();
        Catalog catalog = catalogRepository.findById(dto.getCatalogId())
                .orElseThrow(() -> new RuntimeException("Catálogo não encontrado com id: " + dto.getCatalogId()));
        pickup.setCatalog(catalog);
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

    // Novo método que retorna o campo 'active' para um catalogId ou null se não existir
    public Boolean getActiveByCatalogId(String catalogId) {
        Optional<Pickup> pickupOpt = pickupRepository.findByCatalog_Id(catalogId);
        return pickupOpt.map(Pickup::isActive).orElse(null);
    }


    // Busca pickup pelo catalogId
    public PickupDTO findByCatalogId(String catalogId) {
        Optional<Pickup> opt = pickupRepository.findByCatalog_Id(catalogId);
        if(opt.isPresent()){
            return convertToDTO(opt.get());
        }
        throw new RuntimeException("Pickup não encontrada para catalogId: " + catalogId);
    }

    // Cria ou atualiza pickup caso já exista para o catálogo
    public PickupDTO create(PickupDTO dto) {
        Optional<Pickup> existingPickup = pickupRepository.findByCatalog_Id(dto.getCatalogId());
        if(existingPickup.isPresent()){
            Pickup pickup = existingPickup.get();
            pickup.setActive(dto.isActive());
            pickup.setPrazoRetirada(dto.getPrazoRetirada());
            pickup.setPrecoRetirada(dto.getPrecoRetirada());
            Pickup updated = pickupRepository.save(pickup);
            return convertToDTO(updated);
        } else {
            Pickup pickup = convertToEntity(dto);
            Pickup saved = pickupRepository.save(pickup);
            return convertToDTO(saved);
        }
    }

    public PickupDTO update(String id, PickupDTO dto) {
        Optional<Pickup> opt = pickupRepository.findById(id);
        if(opt.isPresent()){
            Pickup pickup = opt.get();
            pickup.setActive(dto.isActive());
            pickup.setPrazoRetirada(dto.getPrazoRetirada());
            pickup.setPrecoRetirada(dto.getPrecoRetirada());
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

    // Novo método: busca detalhes do pickup ativo e do endereço do catálogo
    public PickupActiveDetailsDTO findActivePickupDetailsByCatalogId(String catalogId) {
        Optional<Pickup> opt = pickupRepository.findByCatalog_Id(catalogId);
        if(opt.isPresent()){
            Pickup pickup = opt.get();
            if(pickup.isActive()){
                // Cria um DTO de endereço a partir da entidade do catálogo
                AddressDTO addressDTO = new AddressDTO(pickup.getCatalog().getAddress());
                PickupActiveDetailsDTO details = new PickupActiveDetailsDTO();
                details.setActive(pickup.isActive());
                details.setPrazoRetirada(pickup.getPrazoRetirada());
                details.setPrecoRetirada(pickup.getPrecoRetirada());
                details.setAddress(addressDTO);
                return details;
            } else {
                throw new RuntimeException("Pickup não está ativo para o catálogo com id: " + catalogId);
            }
        }
        throw new RuntimeException("Pickup não encontrada para catalogId: " + catalogId);
    }
}
