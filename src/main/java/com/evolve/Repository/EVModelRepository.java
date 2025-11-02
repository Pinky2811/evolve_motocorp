package com.evolve.Repository;

import com.evolve.model.EVModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EVModelRepository extends JpaRepository<EVModel, Long> {
}
