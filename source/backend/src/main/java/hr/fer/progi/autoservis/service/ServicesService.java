package hr.fer.progi.autoservis.service;

import hr.fer.progi.autoservis.model.Services;
import hr.fer.progi.autoservis.repository.ServicesRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServicesService {

    private final ServicesRepository servicesRepository;

    public ServicesService(ServicesRepository servicesRepository){
        this.servicesRepository = servicesRepository;
    }

    public List<Services> getAllServices(){
        return servicesRepository.findAll();
    }
}
