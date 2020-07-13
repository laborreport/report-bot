import { Setup } from './Setup/Setup';
import { ExampleSetup } from './paper/ExampleSetup';

if (!process.env.EXAMPLE) {
    Setup();
} else {
    ExampleSetup();
}
