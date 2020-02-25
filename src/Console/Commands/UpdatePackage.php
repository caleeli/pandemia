<?php

namespace Jdd\Pandemia\Console\Commands;

use Illuminate\Console\Command;
use Jdd\Pandemia\Models\Action;
use Jdd\Pandemia\Models\Map;
use Jdd\Pandemia\PackageServiceProvider;

class UpdatePackage extends Command
{
    /**
     * The name and signature of the console command.
     *
     *
     * @var string
     */
    protected $signature = 'jdd-pandemia:jdd-update';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update the installed jdd package';

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        Action::truncate();
        $actions = parse_ini_file(__DIR__ . '/actions.ini', true);
        foreach ($actions as $name => $properties) {
            $action = Action::firstOrNew(['name' => $name]);
            foreach ($properties as $name => $value) {
                if (substr(trim($name), 0, 1) === '#') {
                    unset($properties[$name]);
                }
            }
            $action->fill($properties);
            $action->save();
        }
        $this->info('Build asset: ' . $this->signature);
        $dir = getcwd();
        chdir(__DIR__ . '/../../../');
        file_exists('node_modules') ?: exec('npm install');
        exec('npm run build');
        chdir($dir);
        $this->call('vendor:publish', ['--provider' => PackageServiceProvider::class, '--force' => true]);
        $map = Map::find(1);
        $mapImg = basename(glob(public_path('modules/' . PackageServiceProvider::PluginName . '/img/world_map*'))[0]);
        if (!$map) {
            Map::create([
                'map' => url('/modules/' . PackageServiceProvider::PluginName . '/img/' . $mapImg),
                'lights' => realpath(__DIR__ . '/../../assets/world_lights.png'),
            ]);
        } else {
            $map->fill([
                'map' => url('/modules/' . PackageServiceProvider::PluginName . '/img/' . $mapImg),
                'lights' => realpath(__DIR__ . '/../../assets/world_lights.png'),
            ]);
            $map->save();
        }
    }
}
