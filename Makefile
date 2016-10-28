PREFIX=./node_modules/.bin
SELF=$(lastword $(MAKEFILE_LIST))
## Compiler
# The compiler to use for the ES7 -> ES5 transformation
JC=$(PREFIX)/babel
# Location of files
SRC=src/
OUT=dist/
# The flags to pass to the compiler
JCFLAGS=$(SRC) -d $(OUT)

# Tests
TESTRUNNER=$(PREFIX)/mocha
TFLAGS=--reporter spec

## Rules
all: default

# The default task
# The **production** build
default: $(JC)
	$(JC) $(JCFLAGS) --minified
	$(BIN_MAKE)

# Development build task
# This builds and includes source maps
build: $(JC)
	$(JC) $(JCFLAGS) --source-maps
	$(BIN_MAKE)

test: $(TESTRUNNER) ;
#	$(TESTRUNNER) $(TFLAGS)

clean:
	rm -rf ./dist/

.PHONY: test
