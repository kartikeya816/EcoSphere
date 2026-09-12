package com.ecosphere.ecosphere.repository;

import com.ecosphere.ecosphere.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Integer> {
}
