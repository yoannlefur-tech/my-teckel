<?php

$finder = (new PhpCsFixer\Finder())
    ->in(__DIR__)
    ->exclude('var')
    // Symfony and Flex rewrite these files on their own: any reformatting would
    // be lost and the check would fail again after a cache:clear or a recipe.
    ->notPath([
        'config/bundles.php',
        'config/reference.php',
    ])
;

return (new PhpCsFixer\Config())
    ->setRiskyAllowed(true)
    ->setRules([
        '@PSR12' => true,
        'declare_strict_types' => true,
    ])
    ->setFinder($finder)
;
