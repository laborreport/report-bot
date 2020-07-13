import { Setup } from './Setup/Setup';
import { ExampleSetup } from './paper/ExampleSetup';

console.log(process.env);
if (!process.env.EXAMPLE) {
    Setup();
} else {
    ExampleSetup();
}
