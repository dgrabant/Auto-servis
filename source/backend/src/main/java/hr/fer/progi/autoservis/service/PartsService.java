package hr.fer.progi.autoservis.service;

import hr.fer.progi.autoservis.model.Parts;
import hr.fer.progi.autoservis.repository.PartsRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PartsService {

    private final PartsRepository partsRepository;

    public PartsService(PartsRepository partsRepository){
        this.partsRepository = partsRepository;
    }

    public List<Parts> getAllParts(){
        return partsRepository.findAll();
    }
}
