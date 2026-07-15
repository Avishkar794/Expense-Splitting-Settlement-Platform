package com.avishkar.ExpenseMgmt.factory;

import com.avishkar.ExpenseMgmt.enums.SplitType;
import com.avishkar.ExpenseMgmt.strategy.EqualSplitStrategy;
import com.avishkar.ExpenseMgmt.strategy.ExactSplitStrategy;
import com.avishkar.ExpenseMgmt.strategy.PercentageSplitStrategy;
import com.avishkar.ExpenseMgmt.strategy.SplitStrategy;
import org.springframework.stereotype.Component;

@Component
public class SplitStrategyFactory {

    private final EqualSplitStrategy equalSplitStrategy;
    private final ExactSplitStrategy exactSplitStrategy;
    private final PercentageSplitStrategy percentageSplitStrategy;

    public SplitStrategyFactory(EqualSplitStrategy equalSplitStrategy,
                                ExactSplitStrategy exactSplitStrategy,
                                PercentageSplitStrategy percentageSplitStrategy) {
        this.equalSplitStrategy = equalSplitStrategy;
        this.exactSplitStrategy = exactSplitStrategy;
        this.percentageSplitStrategy = percentageSplitStrategy;
    }

    public SplitStrategy getStrategy(SplitType splitType) {
        return switch (splitType) {
            case EQUAL -> equalSplitStrategy;
            case EXACT -> exactSplitStrategy;
            case PERCENTAGE -> percentageSplitStrategy;
        };
    }
}
