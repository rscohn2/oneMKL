function matchesPattern(domain, filePaths) {
    // filter files that end in .md
    filePaths = filePaths.filter(filePath => !filePath.endsWith('.md'));
    // These directories contain domain specific code
    const dirs = '(tests/unit_tests|examples|src|include/oneapi/mkl)'
    const domains = '(blas|lapack|rng|dft)'
    // matches changes to the domain of interest or non domain-specific code
    const re = new RegExp(`^(${dirs}/${domain}|(?!${dirs}/${domains}))`);
    const match = filePaths.some(filePath => re.test(filePath));
    return match;
}

function prFiles(github, context) {
  const pr = context.payload.pull_request
  if (!pr) {
    return []
  }
  const prFiles = github.rest.pulls.listFiles({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: pr.number
  });
  console.log("PR files: ", prFiles)
  return prFiles
}
module.exports = ({github, context}) => {
    return github.rest.pulls;
  }
/*
module.exports = ({github, context}) => {
    const domain = "blas";
    const match = matchesPattern(domain, prFiles(github, context));
    console.log("domain: ", domain, " Match: ", match)
    return match;
}
*/
test_patterns = [
    {
        domain: 'blas',
        files: [
            'tests/unit_tests/blas/test_blas.cpp',
        ],
        expected: true
    },
    {
        domain: 'rng',
        files: [
            'examples/rng/example_rng.cpp',
        ],
        expected: true
    },
    {
        domain: 'lapack',
        files: [
            'include/oneapi/mkl/lapack/lapack.hpp',
        ],
        expected: true
    },
    {
        domain: 'dft',
        files: [
            'src/dft/lapack.hpp',
        ],
        expected: true
    },
    {
        domain: 'dft',
        files: [
            'src/dft/lapack.md',
        ],
        expected: false
    },
    {
        domain: 'blas',
        files: [
            'tests/unit_tests/dft/test_blas.cpp',
        ],
        expected: false
    },
    {
        domain: 'rng',
        files: [
            'examples/blas/example_rng.cpp',
        ],
        expected: false
    },
    {
        domain: 'lapack',
        files: [
            'include/oneapi/mkl/rng/lapack.hpp',
        ],
        expected: false
    },
    {
        domain: 'dft',
        files: [
            'src/lapack/lapack.hpp',
        ],
        expected: false
    },
]

function testPattern(test) {
    const result = matchesPattern(test.domain, test.files)
    if (result !== test.expected) {
        console.log('Fail:')
        console.log('  domain:', test.domain)
        console.log('  files:', test.files)
        console.log('  expected:', test.expected)
        console.log('  result:', result)
        process.exit(1)
    }
}

if (require.main === module) {
    // invoke test for each test pattern
    test_patterns.forEach(testPattern)
}
