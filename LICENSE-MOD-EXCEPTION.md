# WebOrbit Mod and Plugin Exception

Additional permission under section 7 of the GNU Affero General Public License, version 3.

WebOrbit is licensed under the GNU AGPL v3 (see `LICENSE`). As an additional permission under section 7 of that license, the copyright holders grant the following exception.

> **A quick note from me:** I'm a developer, not a lawyer, so I had an AI (Claude, by Anthropic) help me write this exception. It follows the standard section 7 "additional permission" pattern that other open source projects use, but no attorney has reviewed it. What I want is simple: the mods and plugins you make are yours to license however you like, and forks of the game itself stay AGPL. If anything here is unclear, or you need real certainty for your project, just ask me or talk to a lawyer.

## 1. Definitions

- **"Game"** means the WebOrbit program and its source code, as distributed in this repository.
- **"Mod"** means a data file loaded by the Game, such as a part pack, blueprint, config, texture, or other asset, including anything loaded through the Modloader menu or Featured Mods.
- **"Plugin"** means separate code that is loaded by the Game at runtime through its public extension interfaces (for example the hook API, `addHook` / `removeHook` / `runHook`, the plugin system, or the boot manager's injection feature) and that is not distributed as part of the Game itself.

## 2. Permission

You may create, run, convey, and license Mods and Plugins under terms of your choice, including proprietary and closed-source terms, and you are not required to license them under the AGPL or to provide their source code. Loading a Mod or Plugin into the Game does not, by itself, make that Mod or Plugin a covered work under the AGPL.

## 3. Limits

This exception does not apply to:

- **Modified versions of the Game itself** (forks, or patches to the Game's own source). Those remain under the AGPL in full, including section 13 (source offer for network use).
- **Code copied from the Game** into a Mod or Plugin. Any portion of the Game's source code that you copy keeps its AGPL license. Using the public extension interfaces, hook names, and data formats documented for Mods and Plugins is not copying.
- **Third-party assets** that carry their own licenses (for example the planet textures and the VAB, launchtower, and launchpad textures credited in the Game). Those stay under their own terms.

## 4. Removal

As provided in section 7 of the AGPL, if you convey a copy of the Game you may remove this additional permission from your copy. If you do, you must remove it for all of it, and the rest of the AGPL still applies.
