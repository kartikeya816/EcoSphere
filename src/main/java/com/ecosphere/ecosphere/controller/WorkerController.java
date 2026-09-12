package com.ecosphere.ecosphere.controller;

import org.springframework.security.crypto.password.PasswordEncoder;
import com.ecosphere.ecosphere.entity.Worker;
import com.ecosphere.ecosphere.repository.WorkerRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workers")
public class WorkerController {

    private final WorkerRepository workerRepository;
    private final PasswordEncoder passwordEncoder;

    public WorkerController(
            WorkerRepository workerRepository,
            PasswordEncoder passwordEncoder) {

        this.workerRepository = workerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<Worker> getWorkers() {
        return workerRepository.findAll();
    }

    @PostMapping
    public Worker createWorker(@RequestBody Worker worker) {
        return workerRepository.save(worker);
    }

    @PostMapping("/login")
    public Worker workerLogin(@RequestBody Worker worker) {

        List<Worker> workers = workerRepository.findAll();

        for (Worker existingWorker : workers) {

            if (existingWorker.getEmail().equals(worker.getEmail())
                    && passwordEncoder.matches(
                    worker.getPassword(),
                    existingWorker.getPassword())) {

                return existingWorker;
            }
        }

        throw new RuntimeException("Invalid worker email or password");
    }

}

