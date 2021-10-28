package hello.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT) // 409
public class PetStoreDoesNotExists extends  RuntimeException{
    public PetStoreDoesNotExists(long petId){
        super("Pet Id  " + petId + " does not exist.");
    }
}
